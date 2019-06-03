import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { Modal,FormControl,FormGroup,ControlLabel,HelpBlock,Pagination } from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import { isEmpty,has,findIndex } from 'lodash';
import { NavLink } from 'react-router-dom';

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users               : [],
            companies           : [],
            resellers           : [],
            user                : {role_id : ''},
            errors              : {},
            showDeleteModal     : false,
            showFormModal       : false,
            updateForm          : false,
            page_limit          : 10,
            current_page        : 1,
            last_page           : 0,
            page_start          : 0,
            page_end            : 0,
            check_all           : false,
            assignment_ids      : [],
            showMassDeleteModal : false
        };

        this.prepareDeleteUser      = this.prepareDeleteUser.bind(this);
        this.prepareEditUser        = this.prepareEditUser.bind(this);
        this.hideDeleteModal        = this.hideDeleteModal.bind(this);
        this.prepareAddUser         = this.prepareAddUser.bind(this);
        this.hideFormModal          = this.hideFormModal.bind(this);
        this.deleteUser             = this.deleteUser.bind(this);
        this.formChange             = this.formChange.bind(this);
        this.submitForm             = this.submitForm.bind(this);
        this.hideMassDeleteModal    = this.hideMassDeleteModal.bind(this);
        this.massDeleteUsers        = this.massDeleteUsers.bind(this);

    }

    componentDidMount() {
        this.loadUsers(1);
    }

    prepareLoadCompanies(role_id){
        if(role_id == 2 || role_id == 3){
            this.loadCompanies('parent_only');
        }
        if(role_id == 4 || role_id == 5){
            this.loadCompanies('child_only');
        }
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

    loadCompanies(fetch){
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

    loadUsers(page) {
        let user_url_uri = '';
        if(this.props.logged_user.role_id != 1){
            user_url_uri = '&company_id=' + this.props.logged_user.company_id;
        }
        axios({
            method: 'GET',
            url: `/api/users?page=${page}${user_url_uri}`,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
        .then((response) => {
            let users = response.data.data;
            users.forEach(function(value,index) {
                    users[index].checked = false;
                });

            this.setState({
                users: users
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

    prepareDeleteUser(user){
        this.setState({
            user            : user,
            showDeleteModal : true
        });

    }

    prepareEditUser(user){
        this.setState({
            errors        : {},
            user          : user,
            showFormModal : true,
            updateForm    : true
        });

        this.prepareLoadCompanies(user.role_id);
    }

    deleteUser(id,container){
        axios({
            method: 'POST',
            url: `/api/users/${id}`,
            data: {
                _method: 'DELETE'
            },
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
        .then((response) => {
            this.hideDeleteModal();
            this.loadUsers();
            container.success(
              `${response.data.message}`,
              'Success'
            );
        });

    }

    hideDeleteModal() {
        this.setState({
            showDeleteModal:false
        })
    }

    hideFormModal() {
        this.setState({
            errors        : {},
            showFormModal :false,
            updateForm    : false
        })
    }

    submitForm(container){
        this.setState({
            errors : {}
        });
        const updateForm = this.state.updateForm;
        let user = Object.assign({}, this.state.user);
        const { role_id, company_id } = this.props.logged_user;
        // Automatically set company_id on this condition
        if ((role_id == 2 && user.role_id == 3) || (role_id == 4)){
            user.company_id = company_id
        }

        if (role_id == 4) {
            user.role_id = 5;
        }
        const config = {
            method: 'POST',
            url: `/api/users${(updateForm ? `/${user.id}` : '')}`,
            data: user,
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
                    this.hideFormModal();
                    container.success(
                        `Successfully ${(updateForm ? 'updated' : 'created')} user`,
                        'Success'
                    );
                    this.loadUsers();
                },
                (error) => {
                    this.setState({
                        errors : error.response.data.errors
                    });
                }
            );
    }

    formValidationState(field){
        const errors = this.state.errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
    }

    prepareAddUser(Company){
        this.setState({
            user       : {role_id :this.getRoleId()},
            showFormModal : true
        });
    }

    formChange(field,value){
        let user = Object.assign({}, this.state.user);
        user[field] = value;

        if(field == 'role_id'){
            const { role_id, company_id } = this.props.logged_user;
            if(role_id == 1){
                this.prepareLoadCompanies(value);
            } else {
                // Loads Resellers on this condition
                if ((role_id == 2 || role_id == 3 ) && (value == 4 || value == 5)) {
                    this.loadCompanies('child_only',`&company_id=${company_id}`);
                }
            }
        }

        this.setState({user : user});
    }

    massCheck() {
        let {users,check_all}     = this.state;
        const change_check_all_status = check_all ? false : true;
        const assignment_ids          = [];

        users.forEach(function(value,index) {
                    users[index].checked = change_check_all_status;
                    assignment_ids.push(users[index].id);
                });

            this.setState({
                users          : users,
                check_all      : change_check_all_status,
                assignment_ids : assignment_ids
            });

    }

    hideMassDeleteModal() {
        this.setState({
        showMassDeleteModal:false
        })
    }

    massDeleteUsers(container) {
        axios({
            method: 'POST',
            url: `/api/users`,
            data: {
                ids    : this.state.assignment_ids,
                _method: 'DELETE'
            },
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })

        .then((response) => {
            this.hideMassDeleteModal();
            this.loadUsers();
            container.success(
              `${response.data.message}`,
              'Success'
            );
        });

        this.loadUsers;

        this.setState({
            check_all      : false,
            assignment_ids : []
        });

    }

    checkUser(id) {
        let {users,assignment_ids} = this.state;
        users.forEach(function(user,index) {
            if (user.id == id) {
                const change_check_status = user.checked ? false : true;
                users[index].checked = user.checked ? false : true;

                if(change_check_status){
                    assignment_ids.push(id);
                } else {
                    const assignment_ids_index = findIndex(assignment_ids, function(value) { return value == id; });
                    assignment_ids.splice(assignment_ids_index);
                }

            }
        });

        this.setState({
            users : users
        });
    }


    render() {
        let {users,user,resellers,showDeleteModal,showFormModal,updateForm,errors,companies,page_limit,current_page,last_page,page_start,page_end,showMassDeleteModal,check_all} = this.state;
        let container;

        let start = ( current_page >= page_limit ? <Pagination.First onClick={() => this.loadUsers(1)}/> : '');

        let prev = ( current_page != 1 ? <Pagination.Prev onClick={() => this.loadUsers((current_page-1))}/> : '');

        let page_numbers = [];
        let pagination_numbers = [];
        for (var index = page_start; index <= page_end; index++) {
            const page = index;
            pagination_numbers.push(<Pagination.Item active={page == current_page} onClick={() => this.loadUsers(page)}>{page}</Pagination.Item>);
            page_numbers.push((
                <li key={`page-${page}`} className={page == current_page ? 'active' : ''}>
                    <a href="javascript:void(0)" onClick={() => this.loadUsers(page)}>{page}</a>
                </li>
            ));
        }

        let next = ( current_page != page_end ? <Pagination.Next onClick={() => this.loadUsers((current_page+1))}/> : '');

        let end = ( current_page != last_page ? <Pagination.Last onClick={() => this.loadUsers(last_page)}/> : '');

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
                                                onClick={() => this.prepareAddUser()}
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
                                                <i className="icon-trash"></i>&nbsp;Delete
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
                                                <th scope="col">Email</th>
                                                <th scope="col">Company</th>
                                                <th scope="col">Role</th>
                                                <th scope="col">Options</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                users.map(
                                                    user => (
                                                        <tr key={ user.id }>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={user.checked}
                                                                    onClick={() => this.checkUser(user.id)}
                                                                />
                                                                &nbsp;{ user.name }
                                                            </td>
                                                            <td>{ user.email }</td>
                                                            <td>{ user.company }</td>
                                                            <td>{ user.role }</td>
                                                            <td>
                                                                <a className="btn btn-info nav-link" href="#" onClick={() => this.prepareEditUser(user)}>
                                                                    <i className="icon-edit"></i>
                                                                    <small>Edit</small>
                                                                </a>
                                                                <a className="btn btn-danger nav-link" href="#" onClick={() => this.prepareDeleteUser(user)}>
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
                            <Modal.Title bsClass="modal-title text-center"> { !updateForm ? `Add` : `Edit` } User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body">
                            <form>
                                <div className="col-md-10 col-md-offset-1">
                                    <FormGroup
                                        controlId="name"
                                        validationState={this.formValidationState('name')}
                                    >
                                        <ControlLabel>Name</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={user.name}
                                            onChange={(event)=> this.formChange('name',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('name') == 'error' ? errors.name[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup
                                        controlId="email"
                                        validationState={this.formValidationState('email')}
                                    >
                                        <ControlLabel>Email</ControlLabel>
                                        <FormControl
                                            type="text"
                                            value={user.email}
                                            onChange={(event)=> this.formChange('email',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('email') == 'error' ? errors.email[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    {
                                        (this.props.logged_user.role_id != 4)
                                        ?
                                            (
                                            <FormGroup
                                                controlId="role_id"
                                                validationState={this.formValidationState('role_id')}
                                            >
                                                <ControlLabel>Role</ControlLabel>
                                                <FormControl
                                                    componentClass="select"
                                                    value={ user.role_id }
                                                    onChange={(event)=> this.formChange('role_id',event.target.value)}
                                                >
                                                    <option value="">Select Role</option>
                                                    [
                                                        (
                                                            {
                                                                this.props.logged_user.role_id == 1
                                                                ?
                                                                    <option key="1" value="1">Master Admin</option>
                                                                : ''
                                                            }
                                                        )
                                                        (
                                                            {
                                                                this.props.logged_user.role_id == 1
                                                                ?
                                                                    <option key="2" value="2">Company Admin</option>
                                                                : ''
                                                            }
                                                        )
                                                        (
                                                            {
                                                                this.props.logged_user.role_id == 1 || this.props.logged_user.role_id == 2
                                                                ?
                                                                    <option key="3" value="3">Company User</option>
                                                                : ''
                                                            }
                                                        )
                                                        (
                                                            {
                                                                this.props.logged_user.role_id == 1 || this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3
                                                                ?
                                                                    <option key="4" value="4">Reseller Admin</option>
                                                                : ''
                                                            }
                                                        )
                                                        (
                                                            {
                                                                this.props.logged_user.role_id == 1 || this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3 || this.props.logged_user.role_id == 4
                                                                ?
                                                                    <option key="5" value="5">Reseller Staff</option>
                                                                : ''
                                                            }
                                                        )
                                                    ]
                                                </FormControl>
                                                <HelpBlock>{ this.formValidationState('role_id') == 'error' ? errors.role_id[0] : '' }</HelpBlock>
                                            </FormGroup>
                                            )
                                        :''
                                    }
                                    {
                                        (this.props.logged_user.role_id == 1 && user.role_id != 1 || (this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3 && (user.role_id == 4 || user.role_id == 5)))
                                            ?
                                                (
                                                    <FormGroup
                                                        controlId="company_id"
                                                        validationState={this.formValidationState('company_id')}
                                                    >
                                                        <ControlLabel>Company</ControlLabel>
                                                        <FormControl
                                                            componentClass="select"
                                                            value={ user.company_id }
                                                            onChange={(event)=> this.formChange('company_id',event.target.value)}
                                                        >
                                                            <option>Select Company</option>
                                                            {
                                                                companies.map(
                                                                    company => (
                                                                        <option key={ company.id } value={ company.id }>{ company.name }</option>
                                                                    )
                                                                )
                                                            }
                                                        </FormControl>
                                                        <HelpBlock>{ this.formValidationState('company_id') == 'error' ? errors.company_id[0] : '' }</HelpBlock>
                                                    </FormGroup>
                                                )
                                            : ''
                                    }
                                    <FormGroup
                                        controlId="password"
                                        validationState={this.formValidationState('password')}
                                    >
                                        <ControlLabel>Password</ControlLabel>
                                        <FormControl
                                            type="password"
                                            value={user.password}
                                            onChange={(event)=> this.formChange('password',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('password') == 'error' ? errors.password[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <FormGroup>
                                        <ControlLabel>Password Confirmation</ControlLabel>
                                        <FormControl
                                            type="password"
                                            value={user.password_confirmation}
                                            onChange={(event)=> this.formChange('password_confirmation',event.target.value)}
                                        />
                                    </FormGroup>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-default" onClick={this.hideFormModal}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={() => this.submitForm(container)}>{ !updateForm ? `Create` : `Update` }</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteModal} onHide={this.hideDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Delete User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body text-center">
                            <h5>Are you sure want to delete this user?</h5>
                            <h1>{user.name}</h1>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-default" onClick={this.hideDeleteModal}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={() => this.deleteUser(user.id,container)}>Delete</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showMassDeleteModal} onHide={this.hideMassDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Delete User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body text-center">
                            <h5>Are you sure want to delete this users?</h5>
                            <h1>{user.name}</h1>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-default" onClick={this.hideMassDeleteModal}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={() => this.massDeleteUsers(container)}>Delete</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Users;
