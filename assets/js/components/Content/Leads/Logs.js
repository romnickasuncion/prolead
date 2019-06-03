import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { Modal,FormGroup,FormControl,HelpBlock,ControlLabel,Pagination,Glyphicon } from 'react-bootstrap';
import { isEmpty,has } from 'lodash';
import { ToastContainer } from 'react-toastr';
import { DatePicker, DatePickerInput } from 'rc-datepicker';
import 'rc-datepicker/lib/style.css';
import moment from 'moment';
import { NavLink } from 'react-router-dom';

class Logs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            logs               : [],
            log : [],
            errors            : {}, 
            reseller :{},
            resellers: []   ,
            companies: [],
            resellers: []                    
        };

    }

    componentDidMount() {
        this.logs(); 
        if(has(this.props.match,'params') && has(this.props.match.params,'id')){
            this.loadLead(this.props.match.params.id);
        }

        if(this.props.logged_user.role_id == 1){
            this.loadCompanies('parent_only');
        }

        if(this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3){
            this.loadCompanies('child_only');
            // this.loadPersonnel(this.props.logged_user.company_id);
        }
    }

    logs() {
        axios({
            method: 'GET',
            url: '/api/leads/logs',
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                this.setState({
                    logs : response.data.data
                });
                console.log(response);
            })
    }

    loadCompanies(fetch,uri = ''){
        axios({
            method: 'GET',
            url: `/api/companies?fetch=${fetch}${uri}`,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                const retrieved_data = response.data.data;
                if(fetch == 'child_only'){
                    this.setState({
                        companies: retrieved_data
                    });
                } else {
                    this.setState({
                        resellers: retrieved_data
                    });
                }
            })
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

    formChange(field,value){
        let logs = Object.assign({}, this.state.logs);
        logs[field] = value;

        if(field == 'parent_company_id'){
            this.setState({
                personnel: [],
                resellers: [],
            });
            this.loadCompanies('child_only',`&company_id=${value}`);
            logs.assigned_company_id = value;
            logs = omit(logs,['assigned_personnel_id']);
        }

        if(field == 'child_company_id'){
            this.setState({
                personnel: []
            });
            this.loadPersonnel(value);
            logs.assigned_company_id = value;
            logs = omit(logs,['assigned_personnel_id']);
        }        

        this.setState({logs : logs});
    }        

    formValidationState(field){
        const errors = this.state.errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
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
        let container;
        const {logged_user} = this.props;
        let {reseller,log,logs} = this.state;    
        const {companies,resellers} = this.state;


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
                                                className={`nav-link`}                                            
                                                href="javascript:void(0)"
                                            >
                                                Logs
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">               
                        <div className="dash-sub-nav">                        
                            <ul className="nav nav-pills justify-content-center">
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                    >
                                        <i className=""></i>
                                        Search by:
                                    </a>
                                </li>                         
                                <li className="nav-item">
                                    <FormGroup
                                        controlId="child_company_id"
                                        validationState={this.formValidationState('child_company_id')}
                                    >
                                        <FormControl
                                            componentClass="select"
                                            value={ logs.child_company_id }
                                            onChange={(event)=> this.formChange('child_company_id',event.target.value)}
                                        >
                                            <option value="">Reseller</option>
                                            {
                                                resellers.map(
                                                    reseller => (
                                                        <option key={ reseller.id } value={ reseller.id }>{ reseller.name }</option>
                                                    )
                                                )
                                            }
                                        </FormControl>
                                        <HelpBlock>{ this.formValidationState('child_company_id') == 'error' ? errors.assigned_company_id[0] : '' }</HelpBlock>
                                    </FormGroup>
                                </li>  
                                <li className="nav-item">
                                    <FormGroup
                                            controlId="need_urgency"
                                        >
                                            <FormControl
                                                componentClass="select"
                                                
                                            >
                                                <option key="stage-leads-in" value="Leads-In">Lead Name</option>                                                
                                                            <option key="stage-contact-made" value="Contact Made">Contact Made</option>,
                                                            <option key="stage-meeting-arranged" value="Meeting Arranged">Meeting Arranged</option>,
                                                            <option key="stage-needs-defined" value="Needs Defined">Needs Defined</option>,
                                                            <option key="stage-proposal-made" value="Proposal Made">Proposal Made</option>,
                                                            <option key="stage-negotiations" value="Negotiations">Negotiations</option>,
                                                            <option key="stage-won" value="Won">Won</option>,
                                                            <option key="stage-lost" value="Lost">Lost</option>,
                                                            <option key="stage-rotten" value="Rotten">Rotten</option>
                                                 
                                            </FormControl>
                                    </FormGroup>
                                </li>                                                                                                                                      
                            </ul>
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
                                                <th scope="col">Lead Name</th>
                                                <th scope="col">Assigned Personnel</th>
                                                <th scope="col">Reseller</th>
                                                <th scope="col">Activity/Log</th>
                                                <th scope="col">Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                logs.map(
                                                    log => (
                                                        <tr key={ log.id }>
                                                            <td>{log.lead_id}</td>
                                                            <td>{log.assigned_personnel_id}</td>
                                                            <td>{log.assigned_company_id}</td>
                                                            <td>{log.activity}</td>
                                                            <td>{log.created_at}</td>
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

                    <div className="col-md-12 text-center">
                        <Pagination>

                        </Pagination>
                    </div>

                </div>
            </div>
        );
    }
}

export default Logs;
