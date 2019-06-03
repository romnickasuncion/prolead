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
            users               : [],
            companies           : [],            
            user                : {},
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
        this.massDeleteUsers    = this.massDeleteUsers.bind(this);        

    }

    componentDidMount() {
        this.loadUsers(1);
        this.loadCompanies();        
    }   

    loadCompanies(){
        axios({
            method: 'GET',
            url: '/api/companies?fetch=all',
        })
            .then((response) => {
                this.setState({
                    companies: response.data.data
                });
            })
    }   

    loadUsers(page) {
        axios({
            method: 'GET',
            url: `/api/users?page=${page}`,
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
            user : user,
            showDeleteModal : true
        });

    }

    prepareEditUser(user){
        this.setState({
            user : user,
            showFormModal : true,
            updateForm    : true
        });

    }    

    deleteUser(id,container){
        axios({
            method: 'POST',
            url: `/api/users/${id}`,
            data: {
                _method: 'DELETE'
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
        showFormModal:false,
        updateForm   : false
        })
    }    

    submitForm(container){
        this.setState({
            errors : {}
        });
        const {updateForm,user} = this.state;
        const config = {
            method: 'POST',
            url: `/api/users${(updateForm ? `/${user.id}` : '')}`,
            data: user
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
            user       : {},
            showFormModal : true
        });
    }

    formChange(field,value){
        let user = Object.assign({}, this.state.user);
        user[field] = value;
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
        let {users,user,showDeleteModal,showFormModal,updateForm,errors,companies,page_limit,current_page,last_page,page_start,page_end,showMassDeleteModal,check_all} = this.state;
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
                                            <th scope="col">Email</th>
                                            <th scope="col">Company</th>
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
                                                        <td><input type="text" id="email"/></td>
                                                        <td><input type="text" id="company"/></td>
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
