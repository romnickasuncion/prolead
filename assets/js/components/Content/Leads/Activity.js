import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { Modal,FormControl,FormGroup,ControlLabel,HelpBlock,Pagination,DateTimeField } from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import { isEmpty,has,findIndex } from 'lodash';
import { NavLink } from 'react-router-dom';
import { DatePicker, DatePickerInput } from 'rc-datepicker';
import 'rc-datepicker/lib/style.css';

class Activity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leads               : [],
            lead                : {},
            showDeleteModal     : false,
            retrieve            : '',
            companies           : [],
            selectedDate        : new Date()
        };
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
    }

    onChange(date) {
        this.setState({
            selectedDate: date
        });
    }

    formValidationState(field){
        const errors = this.state.errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
    }

    formChange(field,value){
        let lead = Object.assign({}, this.state.lead);
        lead[field] = value;

        if(field == 'parent_company_id'){
            this.setState({
                personnel: [],
                resellers: [],
            });
            this.loadCompanies('child_only',`&company_id=${value}`);
            lead = omit(lead,['assigned_company_id','assigned_personnel_id']);
        }

        if(field == 'child_company_id'){
            this.setState({
                personnel: []
            });
            this.loadPersonnel(value);
            lead = omit(lead,['assigned_personnel_id']);
        }

        this.setState({lead : lead});
    }

    loadPersonnel(id){
        axios({
            method: 'GET',
            url: `/api/users?fetch=all&company_id=${id}`,
            headers: {'Authorization' : `Bearer ${this.props.logged_user.token}`}
        })
            .then((response) => {
                this.setState({
                    personnel: response.data.data
                });
            })
    }

    render() {
            let {leads,lead,showDeleteModal,retrieve,companies,date,format,mode,inputFormat} = this.state;
            let container;

        return (
            <div>
                <ToastContainer
                    ref={ref => container = ref}
                    className="toast-top-right"
                />
                <Animated animationIn="fadeIn">
                    <div className="sub-nav-wrap">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    <ul className="nav nav-pills nav-justified">
                                        {
                                            this.props.logged_user.role_id == 1
                                            ?
                                                [
                                                    (
                                                        <li className="nav-item">
                                                            <a
                                                                className={`nav-link${ retrieve == '' ? ' active' : '' }`}
                                                                href="javascript:void(0)"
                                                                onClick={() => this.setRetrieve('')}
                                                            >
                                                                All Leads
                                                            </a>
                                                        </li>
                                                    ),
                                                    (
                                                        <li className="nav-item">
                                                            <a
                                                                className={`nav-link${ retrieve == 'pending_bant' ? ' active' : '' }`}
                                                                href="javascript:void(0)"
                                                                onClick={() => this.setRetrieve('pending_bant')}
                                                            >
                                                                Pending BANT
                                                            </a>
                                                        </li>
                                                    ),
                                                    (
                                                        <li className="nav-item">
                                                            <a
                                                                className={`nav-link${ retrieve == 'pending_assignment' ? ' active' : '' }`}
                                                                href="javascript:void(0)"
                                                                onClick={() => this.setRetrieve('pending_assignment')}
                                                            >
                                                                Pending Assignment
                                                            </a>
                                                        </li>
                                                    )
                                                ]
                                            : ''
                                        }
                                    </ul>
                                </div>

                                <div className="col-md-4">
                                    <form className="pull-right">
                                        <input type="text" placeholder="Search" />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="dash-sub-nav">
                            <ul className="nav nav-pills justify-content-center">
                                <li className="nav-item">
                                    <a
                                        className="nav-link active"
                                        href="javascript:void(0)"
                                        onClick={() => this.prepareAddLead()}
                                    >
                                        <i className="icon-circle-plus"></i>Add Activity
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setState({showMassDeleteModal:true})}
                                    >
                                        <i className="icon-flag"></i>Activity History
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Animated>
                <div className="container">
                    <div className="col-md-12">
                        <Animated animationIn="fadeInUp">
                            <div className="table-wrap">
                                <table className="table table-striped table-responsive">
                                    <thead>
                                        <tr>
                                            <th scope="col">Add Activity</th>
                                            <th scope="col"></th>
                                            <th scope="col"></th>
                                            <th scope="col"></th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                                <div className="form-group">
                                    <form>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="col-md-6">
                                                    {
                                                        this.props.logged_user.role_id == 1
                                                        ?
                                                            <div className="col-md-6">
                                                                <FormGroup
                                                                    controlId="parent_company_id"
                                                                    validationState={this.formValidationState('parent_company_id')}
                                                                >
                                                                    <ControlLabel>Choose Lead</ControlLabel>
                                                                    <FormControl
                                                                        componentClass="select"
                                                                        value={ lead.parent_company_id }
                                                                        onChange={(event)=> this.formChange('parent_company_id',event.target.value)}
                                                                    >
                                                                        <option selected value="">Lead</option>
                                                                        {
                                                                            companies.map(
                                                                                company => (
                                                                                    <option key={ company.id } value={ company.id }>{ company.name }</option>
                                                                                )
                                                                            )
                                                                        }
                                                                    </FormControl>
                                                                    <HelpBlock>{ this.formValidationState('parent_company_id') == 'error' ? errors.assigned_company_id[0] : '' }</HelpBlock>
                                                                </FormGroup>
                                                            </div>
                                                        : ''
                                                    }
                                                </div>
                                                <div className="col-md-6">
                                                    {
                                                        this.props.logged_user.role_id == 1
                                                        ?
                                                            <div className="col-md-6">
                                                                <FormGroup
                                                                    controlId="parent_company_id"
                                                                    validationState={this.formValidationState('parent_company_id')}
                                                                >
                                                                    <ControlLabel>Choose Activity</ControlLabel>
                                                                    <FormControl
                                                                        componentClass="select"
                                                                        value={ lead.parent_company_id }
                                                                        onChange={(event)=> this.formChange('parent_company_id',event.target.value)}
                                                                    >
                                                                        <option>Call</option>
                                                                        <option selected value="">Meeting</option>
                                                                        <option>Email</option>
                                                                        <option>Send Proposal</option>
                                                                        <option>Follow Up</option>
                                                                    </FormControl>
                                                                    <HelpBlock>{ this.formValidationState('parent_company_id') == 'error' ? errors.assigned_company_id[0] : '' }</HelpBlock>
                                                                </FormGroup>
                                                            </div>
                                                        : ''
                                                    }
                                                </div>
                                                <div className="col-md-3">
                                                    <div>
                                                        <ControlLabel>Choose Date</ControlLabel>
                                                        <DatePickerInput
                                                            onChange={this.onChange}
                                                            value={this.state.selectedDate}
                                                            className='my-custom-datepicker-component'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Animated>
                    </div>
                </div>
            </div>
        );
    }
}

export default Activity;
