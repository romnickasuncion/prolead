import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { Modal,FormControl,FormGroup,ControlLabel,HelpBlock,Pagination } from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import { isEmpty,has,findIndex } from 'lodash';
import { NavLink } from 'react-router-dom';
import ReactTooltip from 'react-tooltip'

class ResellersAll extends Component {
    constructor(props) {
        super(props);
        this.state = {
            companies           : [],
            company             : {},
            company_errors      : {},
            user_errors         : {},
            showDeleteModal     : false,
            showFormModal       : false,
            showEditFormModal   : false,
            updateForm          : false,
            page_limit          : 10,
            current_page        : 1,
            last_page           : 0,
            page_start          : 0,
            page_end            : 0,
            check_all           : false,
            assignment_ids      : [],
            showMassDeleteModal : false,
            parent_companies    : [],
            users               : [],
            user                : {role_id : this.getRoleId()}
        };

        this.prepareDeleteCompany   = this.prepareDeleteCompany.bind(this);
        this.prepareAddCompany      = this.prepareAddCompany.bind(this);
        this.hideDeleteModal        = this.hideDeleteModal.bind(this);
        this.hideFormModal          = this.hideFormModal.bind(this);
        this.hideEditFormModal      = this.hideEditFormModal.bind(this);
        this.deleteCompany          = this.deleteCompany.bind(this);
        this.formChange             = this.formChange.bind(this);
        this.submitForm             = this.submitForm.bind(this);
        this.hideMassDeleteModal    = this.hideMassDeleteModal.bind(this);
        this.massDeleteCompanies    = this.massDeleteCompanies.bind(this);

    }

    componentDidMount() {
        this.loadCompanies(1);

        if(this.props.logged_user.role_id == 1){
            this.loadParentCompanies();
        }
    }

    loadParentCompanies(){
        axios({
            method: 'GET',
            url: '/api/companies?fetch=parent_only',
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                this.setState({
                    parent_companies: response.data.data
                });
            })
    }

    loadCompanies(page) {
        axios({
            method: 'GET',
            url: `/api/companies?fetch=child_only&page=${page}`,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
        .then((response) => {
            let companies = response.data.data;
            companies.forEach(function(value,index) {
                    companies[index].checked = false;
                });


            this.setState({
                companies: companies
            });
            this.processPagination(response.data.meta);
        });
    }

    processPagination(pagination_meta){
        const page_limit   = this.state.page_limit;
        const current_page = pagination_meta.current_page;
        const last_page    = pagination_meta.last_page;
        let page_start     = current_page >= page_limit ? (current_page - 4) : 1;
        let page_end       = last_page < page_limit ? last_page : page_limit;

        if(current_page >= page_limit){
            page_end   = current_page + 5;

            if(page_end > last_page) {
                const extra_difference = page_end - last_page;
                page_end   -= extra_difference;
                page_start -= extra_difference;
            }
        }

        this.setState({
            current_page : current_page,
            last_page    : last_page,
            page_start   : page_start,
            page_end     : page_end
        });
    }

    prepareDeleteCompany(company){
        this.setState({
            company : company,
            showDeleteModal : true
        });

    }

    prepareEditCompany(company){
        this.setState({
            errors : {},
            company : company,
            showEditFormModal : true,
            updateForm    : true
        });

    }

    deleteCompany(id,container){
        axios({
            method: 'POST',
            url: `/api/companies/${id}`,
            data: {
                _method: 'DELETE'
            },
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
        .then((response) => {
            this.hideDeleteModal();
            this.loadCompanies();
            container.success(
              `${response.data.message}`,
              'Success'
            );
        });

    }

    massCheck() {
        let {companies,check_all}     = this.state;
        const change_check_all_status = check_all ? false : true;
        const assignment_ids          = [];

        companies.forEach(function(value,index) {
                    companies[index].checked = change_check_all_status;
                    assignment_ids.push(companies[index].id);
                });

            this.setState({
                companies      : companies,
                check_all      : change_check_all_status,
                assignment_ids : assignment_ids
            });

    }

    hideDeleteModal() {
        this.setState({
        showDeleteModal:false
        })
    }

    hideMassDeleteModal() {
        this.setState({
        showMassDeleteModal:false
        })
    }

    massDeleteCompanies(container) {
        axios({
            method: 'POST',
            url: `/api/companies`,
            data: {
                ids    : this.state.assignment_ids,
                _method: 'DELETE'
            }
        })

        .then((response) => {
            this.hideMassDeleteModal();
            this.loadCompanies();
            container.success(
              `${response.data.message}`,
              'Success'
            );
        });

        this.loadCompanies;

        this.setState({
            check_all      : false,
            assignment_ids : []
        });

    }

    hideFormModal() {
        this.setState({
            errors : {},
            showFormModal:false,
            updateForm   : false
        })
    }

    hideEditFormModal() {
        this.setState({
            errors : {},
            showEditFormModal:false,
            updateForm   : false
        })
    }

    processCompanyBeforeSubmit(company){
        let will_submit_company = company;

        if(this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3){
            will_submit_company.parent_company_id = this.props.logged_user.company_id;
        }

        return will_submit_company;
    }

    submitForm(container){
        this.setState({
            errors : {}
        });
        const {updateForm,company} = this.state;
        const config = {
            method: 'POST',
            url: `/api/companies${(updateForm ? `/${company.id}` : '')}`,
            data: this.processCompanyBeforeSubmit(company),
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        };

        if(updateForm){
            config.data._method = 'PATCH'
        }

        axios(config)
            .then(
                (response) => {
                    const company = response.data.data;
                    this.setState({ company: company });
                    if(has(company,'id')){
                        this.setState({ updateForm: true });
                    }
                    this.submitUserForm(container,company.id);
                },
                (error) => {
                    this.setState({
                        company_errors : error.response.data.errors
                    });
                }
            );
    }

    submitUpdateForm(container){
        this.setState({
            errors : {}
        });
        const {updateForm,company} = this.state;
        const config = {
            method: 'POST',
            url: `/api/companies${(updateForm ? `/${company.id}` : '')}`,
            data: this.processCompanyBeforeSubmit(company),
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        };

        if(updateForm){
            config.data._method = 'PATCH'
        }

        axios(config)
            .then(
                (response) => {
                    this.hideEditFormModal();
                    container.success(
                        `Successfully ${(updateForm ? 'updated' : 'created')} company`,
                        'Success'
                    );
                    this.loadCompanies();
                },
                (error) => {
                    this.setState({
                        company_errors : error.response.data.errors
                    });
                }
            );
    }

    formValidationState(field,state_error){
        const errors = state_error == 'company' ? this.state.company_errors : this.state.user_errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
    }

    prepareAddCompany(Company){
        this.setState({
            errors : {},
            company       : {},
            showFormModal : true
        });
    }

    formChange(field,value){
        let company = Object.assign({}, this.state.company);
        company[field] = value;
        this.setState({company : company});
    }

    checkCompany(id) {
        let {companies,assignment_ids} = this.state;
        companies.forEach(function(company,index) {
            if (company.id == id) {
                const change_check_status = company.checked ? false : true;
                companies[index].checked = company.checked ? false : true;

                if(change_check_status){
                    assignment_ids.push(id);
                } else {
                    const assignment_ids_index = findIndex(assignment_ids, function(value) { return value == id; });
                    assignment_ids.splice(assignment_ids_index);
                }

            }
        });

        this.setState({
            companies : companies
        });
    }

    getRoleId(){
        if(this.props.logged_user.role_id == 2){
            return 2;
        }

        if(this.props.logged_user.role_id == 4){
            return 4;
        }

        return 1;
    }

    formUserChange(field,value){
        let user = Object.assign({}, this.state.user);
        user[field] = value;
        this.setState({user : user});
        if(field == 'role_id'){
            this.prepareLoadCompanies(value);
        }
    }

    prepareLoadCompanies(role_id){
        if(role_id == 2 || role_id == 3){
            this.loadUserCompanies('parent_only');
        }
        if(role_id == 4 || role_id == 5){
            this.loadUserCompanies('child_only');
        }
    }

    loadUserCompanies(fetch){
        axios({
            method: 'GET',
            url: `/api/companies?fetch=${fetch}`,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                this.setState({
                    companies: response.data.data
                });
            })
    }

    submitUserForm(container,company_id){
        this.setState({
            errors : {}
        });
        const {updateForm,user,company} = this.state;
        user.company_id = company_id;
        user.role_id = 4;
        const config = {
            method: 'POST',
            url: `/api/users`,
            data: user,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        };

        axios(config)
            .then(
                (response) => {
                    this.hideFormModal();
                    container.success(
                        `Successfully ${(updateForm ? 'updated' : 'created')} company`,
                        'Success'
                    );
                    this.loadCompanies();

                },
                (error) => {
                    this.setState({
                        user_errors : error.response.data.errors
                    });
                }
            );
    }

    render() {
        let {companies,company,showDeleteModal,showFormModal,showEditFormModal,updateForm,company_errors,user_errors,user,users,page_limit,current_page,last_page,page_start,page_end,showMassDeleteModal,check_all,parent_companies} = this.state;
        let container;

        let start = ( current_page >= page_limit ? <Pagination.First onClick={() => this.loadCompanies(1)}/> : '');

        let prev = ( current_page != 1 ? <Pagination.Prev onClick={() => this.loadCompanies((current_page-1))}/> : '');

        let page_numbers = [];
        let pagination_numbers = [];
        for (var index = page_start; index <= page_end; index++) {
            const page = index;
            pagination_numbers.push(<Pagination.Item active={page == current_page} onClick={() => this.loadCompanies(page)}>{page}</Pagination.Item>);
            page_numbers.push((
                <li key={`page-${page}`} className={page == current_page ? 'active' : ''}>
                    <a href="javascript:void(0)" onClick={() => this.loadCompanies(page)}>{page}</a>
                </li>
            ));
        }

        let next = ( current_page != page_end ? <Pagination.Next onClick={() => this.loadCompanies((current_page+1))}/> : '');

        let end = ( current_page != last_page ? <Pagination.Last onClick={() => this.loadCompanies(last_page)}/> : '');

        return (
            <div>
                <ToastContainer
                    ref={ref => container = ref}
                    className="toast-top-right"
                />
                <Animated animationIn="fadeIn">
                    <div className="dash-nav-wrap">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    <ul className="nav nav-pills">
                                        <li className="nav-item">
                                            <a
                                                className="nav-link active"
                                                href="javascript:void(0)"
                                                onClick={() => this.prepareAddCompany()}
                                            >
                                                <i className="icon-circle-plus" ></i>&nbsp;New
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className="nav-link"
                                                href="javascript:void(0)"
                                                onClick={() => this.setState({showMassDeleteModal:true})}
                                            >
                                                <i className="icon-trash"></i>Delete
                                            </a>
                                        </li>
                                    </ul>
                                 </div>

                                <div className="col-md-4">
                                    <form className="pull-right">
                                      <input type="text" placeholder="Search"/>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </Animated>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <Animated animationIn="fadeInUp">
                                <div className="table-wrap">
                                    <table className="table table-striped table-responsive">
                                        <thead>
                                            <tr>
                                                <th scope="col">
                                                    <input
                                                        type="checkbox"
                                                        checked={check_all}
                                                        onClick={() => this.massCheck()}
                                                    />
                                                    &nbsp;Name
                                                </th>
                                                <th scope="col">Address</th>
                                                <th scope="col">Tax Number</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Phone</th>
                                                <th scope="col">Parent Company</th>
                                                <th scope="col">Options</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                companies.map(
                                                    company => (
                                                        <tr key={ company.id }>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={company.checked}
                                                                    onClick={() => this.checkCompany(company.id)}
                                                                />
                                                                &nbsp;{ company.name }
                                                            </td>
                                                            <td>{ company.address }</td>
                                                            <td>{ company.tax_number }</td>
                                                            <td>{ company.email }</td>
                                                            <td>{ company.phone }</td>
                                                            <td>{ company.parent_company }</td>
                                                            <td>
                                                                <a
                                                                    className="btn btn-info nav-link"
                                                                    href="javascript:void(0)"
                                                                    onClick={() => this.prepareEditCompany(company)}
                                                                >
                                                                    <i className="icon-edit"></i>
                                                                    <small>Edit</small>
                                                                </a>
                                                                <a
                                                                    className="btn btn-danger nav-link"
                                                                    href="#"
                                                                    onClick={() => this.prepareDeleteCompany(company)}
                                                                >
                                                                    <i className="icon-trash"></i>
                                                                    <small>Delete</small>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Animated>
                        </div>

                        <div className="col-md-12 text-center">
                            <ul className="pagination">
                                { start }
                                { prev }
                                { page_numbers }
                                { next }
                                { end }
                            </ul>
                        </div>
                    </div>

                    <Modal show={showFormModal} onHide={this.hideFormModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center"> { !updateForm ? `Add` : `Edit` } Company and User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body">
                            <form>
                                <div className="col-md-6">
                                    <FormGroup
                                        controlId="name"
                                        validationState={this.formValidationState('name','company')}
                                    >
                                        <ControlLabel>Name</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.name}
                                            onChange={(event)=> this.formChange('name',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('name','company') == 'error' ? company_errors.name[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="address"
                                        validationState={this.formValidationState('address','company')}
                                    >
                                        <ControlLabel>Address</ControlLabel>
                                        <FormControl
                                            componentClass="textarea"
                                            value={company.address}
                                            onChange={(event)=> this.formChange('address',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('address','company') == 'error' ? company_errors.address[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="tax_number"
                                        validationState={this.formValidationState('tax_number','company')}
                                    >
                                        <ControlLabel>Tax Number</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.tax_number}
                                            onChange={(event)=> this.formChange('tax_number',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('tax_number','company') == 'error' ? company_errors.tax_number[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="email"
                                        validationState={this.formValidationState('email','company')}
                                    >
                                        <ControlLabel>Email</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.email}
                                            onChange={(event)=> this.formChange('email',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('email','company') == 'error' ? company_errors.email[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="phone"
                                        validationState={this.formValidationState('phone','company')}
                                    >
                                        <ControlLabel>Phone</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.phone}
                                            onChange={(event)=> this.formChange('phone',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('phone','company') == 'error' ? company_errors.phone[0] : '' }</HelpBlock>
                                    </FormGroup>
                                </div>
                                <div className="col-md-6">
                                    <FormGroup
                                        controlId="name"
                                        validationState={this.formValidationState('name','user')}
                                    >
                                        <ControlLabel>User Name</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={user.name}
                                            onChange={(event)=> this.formUserChange('name',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('name','user') == 'error' ? user_errors.name[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="email"
                                        validationState={this.formValidationState('email','user')}
                                    >
                                        <ControlLabel>User Email</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={user.email}
                                            onChange={(event)=> this.formUserChange('email',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('email','user') == 'error' ? user_errors.email[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="password"
                                        validationState={this.formValidationState('password','user')}
                                    >
                                        <ControlLabel>Password</ControlLabel>
                                        <FormControl
                                            type="password"
                                            value={user.password}
                                            onChange={(event)=> this.formUserChange('password',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('password','user') == 'error' ? user_errors.password[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup>
                                        <ControlLabel>Password Confirmation</ControlLabel>
                                        <FormControl
                                            type="password"
                                            value={user.password_confirmation}
                                            onChange={(event)=> this.formUserChange('password_confirmation',event.target.value)}
                                        />
                                    </FormGroup>
                                    {
                                        this.props.logged_user.role_id == 1
                                        ?
                                            <FormGroup
                                                controlId="parent_company_id"
                                                validationState={this.formValidationState('parent_company_id','company')}
                                            >
                                                <ControlLabel>Parent Company</ControlLabel>
                                                <FormControl
                                                    componentClass="select"
                                                    value={ company.parent_company_id }
                                                    onChange={(event)=> this.formChange('parent_company_id',event.target.value)}
                                                >
                                                    <option>Select Parent Company</option>
                                                    {
                                                        parent_companies.map(
                                                            company => (
                                                                <option key={ company.id } value={ company.id }>{ company.name }</option>
                                                            )
                                                        )
                                                    }
                                                </FormControl>
                                                <HelpBlock>{ this.formValidationState('parent_company_id','company') == 'error' ? company_errors.parent_company_id[0] : '' }</HelpBlock>
                                            </FormGroup>
                                        : ''
                                    }
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-primary" onClick={() => this.submitForm(container)}>{ !updateForm ? `Create` : `Update` }</button>
                                    <button type="button" className="btn btn-default" onClick={this.hideFormModal}>Cancel</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showEditFormModal} onHide={this.hideEditFormModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center"> { !updateForm ? `Add` : `Edit` } Company</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body">
                            <form>
                                <div className="col-md-12">
                                    <FormGroup
                                        controlId="name"
                                        validationState={this.formValidationState('name','company')}
                                    >
                                        <ControlLabel>Name</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.name}
                                            onChange={(event)=> this.formChange('name',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('name','company') == 'error' ? company_errors.name[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="address"
                                        validationState={this.formValidationState('address','company')}
                                    >
                                        <ControlLabel>Address</ControlLabel>
                                        <FormControl
                                            componentClass="textarea"
                                            value={company.address}
                                            onChange={(event)=> this.formChange('address',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('address','company') == 'error' ? company_errors.address[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="tax_number"
                                        validationState={this.formValidationState('tax_number','company')}
                                    >
                                        <ControlLabel>Tax Number</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.tax_number}
                                            onChange={(event)=> this.formChange('tax_number',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('tax_number','company') == 'error' ? company_errors.tax_number[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="email"
                                        validationState={this.formValidationState('email','company')}
                                    >
                                        <ControlLabel>Email</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.email}
                                            onChange={(event)=> this.formChange('email',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('email','company') == 'error' ? company_errors.email[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="phone"
                                        validationState={this.formValidationState('phone','company')}
                                    >
                                        <ControlLabel>Phone</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={company.phone}
                                            onChange={(event)=> this.formChange('phone',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('phone','company') == 'error' ? company_errors.phone[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    {
                                        this.props.logged_user.role_id == 1
                                        ?
                                            <FormGroup
                                                controlId="parent_company_id"
                                                validationState={this.formValidationState('parent_company_id','company')}
                                            >
                                                <ControlLabel>Parent Company</ControlLabel>
                                                <FormControl
                                                    componentClass="select"
                                                    value={ company.parent_company_id }
                                                    onChange={(event)=> this.formChange('parent_company_id',event.target.value)}
                                                >
                                                    <option>Select Parent Company</option>
                                                    {
                                                        parent_companies.map(
                                                            company => (
                                                                <option key={ company.id } value={ company.id }>{ company.name }</option>
                                                            )
                                                        )
                                                    }
                                                </FormControl>
                                                <HelpBlock>{ this.formValidationState('parent_company_id','company') == 'error' ? company_errors.parent_company_id[0] : '' }</HelpBlock>
                                            </FormGroup>
                                        : ''
                                    }
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-primary" onClick={() => this.submitUpdateForm(container)}>{ !updateForm ? `Create` : `Update` }</button>
                                    <button type="button" className="btn btn-default" onClick={this.hideEditFormModal}>Cancel</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteModal} onHide={this.hideDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Delete Company</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body text-center">
                            <h5>Are you sure want to delete this company?</h5>
                            <h1>{company.name}</h1>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-primary" onClick={() => this.deleteCompany(company.id,container)}>Delete</button>
                                    <button type="button" className="btn btn-default" onClick={this.hideDeleteModal}>Cancel</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showMassDeleteModal} onHide={this.hideMassDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Delete Company</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body text-center">
                            <h5>Are you sure want to delete this companies?</h5>
                            <h1>{company.name}</h1>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-default" onClick={this.hideMassDeleteModal}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={() => this.massDeleteCompanies(container)}>Delete</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                </div>
            </div>
        );
    }
}

export default ResellersAll;
