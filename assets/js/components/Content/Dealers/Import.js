import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { Modal,FormControl,FormGroup,ControlLabel,HelpBlock,Pagination } from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import { isEmpty,has,findIndex } from 'lodash';

class Import extends Component {
    constructor(props) {
        super(props);
        this.state = {
            companies           : [],
            company             : {},
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

        this.prepareDeleteCompany   = this.prepareDeleteCompany.bind(this);
        this.prepareAddCompany      = this.prepareAddCompany.bind(this);
        this.hideDeleteModal        = this.hideDeleteModal.bind(this);
        this.hideFormModal          = this.hideFormModal.bind(this);
        this.deleteCompany          = this.deleteCompany.bind(this);
        this.formChange             = this.formChange.bind(this);
        this.submitForm             = this.submitForm.bind(this);
        this.hideMassDeleteModal    = this.hideMassDeleteModal.bind(this);
        this.massDeleteCompanies    = this.massDeleteCompanies.bind(this);

    }

    componentDidMount() {
        this.loadCompanies(1);
    }

    loadCompanies(page) {
        axios({
            method: 'GET',
            url: `/api/companies?page=${page}`,
            // headers: {'Authorization' : `Bearer ${this.props.user.token}`}
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
            company : company,
            showFormModal : true,
            updateForm    : true
        });

    }

    deleteCompany(id,container){
        axios({
            method: 'POST',
            url: `/api/companies/${id}`,
            data: {
                _method: 'DELETE'
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
        showFormModal:false,
        updateForm   : false
        })
    }

    submitForm(container){
        this.setState({
            errors : {}
        });
        const {updateForm,company} = this.state;
        const config = {
            method: 'POST',
            url: `/api/companies${(updateForm ? `/${company.id}` : '')}`,
            data: company
            // headers: {'Authorization' : `Bearer ${this.props.user.token}`}
        };

        if(updateForm){
            config.data._method = 'PATCH'
        }

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
                        errors : error.response.data.errors
                    });
                }
            );
    }

    formValidationState(field){
        const errors = this.state.errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
    }

    prepareAddCompany(Company){
        this.setState({
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

    render() {
        let {companies,company,showDeleteModal,showFormModal,updateForm,errors,page_limit,current_page,last_page,page_start,page_end,showMassDeleteModal,check_all} = this.state;
        let container;

        return (
            <div className="container">
                <ToastContainer
                    ref={ref => container = ref}
                    className="toast-top-right"
                />
                <div className="row">
                    <div className="col-md-12">
                        <Animated animationIn="fadeIn">
                            <div className="dash-nav-wrap">
                                <div className="col-md-8">
                                    <ul className="nav nav-pills nav-justified">
                                        <li className="nav-item"><a className="nav-link active" href="#"><input type="file" id="excel"/></a></li>                                    
                                        <li className="nav-item"><a className="nav-link" href="#" onClick={() => this.prepareAddCompany()}><i className="icon-circle-plus" ></i> New</a></li>
                                        <li className="nav-item"><a className="nav-link" href="#" onClick={() => this.setState({showMassDeleteModal:true})} ><i className="icon-trash"></i> Delete</a></li>
                                    </ul>
                                 </div>

                                <div className="col-md-4">
                                    <form className="pull-right">
                                        <button type="button" className="btn btn-primary" >Submit</button>
                                    </form>
                                </div>
                            </div>
                        </Animated>
                    </div>

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
                                                            &nbsp;<input type="text" id="name"/>
                                                        </td>
                                                        <td><textarea id="address"/></td>
                                                        <td><input type="text" id="taxnumber"/></td>
                                                        <td><input type="text" id="email"/></td>
                                                        <td><input type="text" id="phone"/></td>
                                                        <td>
                                                            <a 
                                                                className="nav-link" 
                                                                href="#" 
                                                                onClick={() => this.prepareDeleteCompany(company)}
                                                            >
                                                                <i className="icon-trash"></i>
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
                </div>

            </div>
        );
    }
}

export default Import;
