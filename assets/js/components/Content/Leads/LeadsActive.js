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

class LeadsActive extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lead               : {},
            leads              : [],
            page_limit         : 10,
            current_page       : 1,
            last_page          : 0,
            page_start         : 0,
            page_end           : 0,
            retrieve           : '',
            stage              : '',
            showFormModal      : false,
            showActivityModal  : false,
            personnel          : [],
            errors             : {},
            showDeleteModal    : false,
            activity           : {
                activity_date  : new Date()
            }
        };

        this.hideFormModal       = this.hideFormModal.bind(this);
        this.hideActivityModal   = this.hideActivityModal.bind(this);
        this.onChange            = this.onChange.bind(this);
        this.prepareDeleteLead   = this.prepareDeleteLead.bind(this);
        this.hideDeleteModal     = this.hideDeleteModal.bind(this);
        this.deleteLead          = this.deleteLead.bind(this);

    }

    componentDidMount() {
        this.loadLeads(1);
    }

    loadPersonnel(id){
        axios({
            method: 'GET',
            url: `/api/users?fetch=all&company_id=${id}`,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                this.setState({
                    personnel: response.data.data
                });
            })
    }

    loadLeads(page,retrieve = '',stage = ''){
        axios({
            method: 'GET',
            url: `/api/leads?page=${page}&lead=assigned${retrieve != '' ? `&retrieve=${retrieve}` : ''}${stage != '' ? `&stage=${stage}` : ''}`,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                let leads = response.data.data;
                leads.forEach(function(value,index){
                    leads[index].checked = false;
                });
                this.setState({
                    leads: leads
                });
                this.processPagination(response.data.meta);
            })
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

    setRetrieve(value){
        this.loadLeads(1, value);
        this.setState({
            retrieve : value,
            stage    : ''
        });
    }

    setStage(value){
        this.loadLeads(1, this.state.retrieve, value);
        this.setState({
            stage : value
        });
    }

    formValidationState(field){
        const errors = this.state.errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
    }

    prepareEditLead(id,company_id){
        this.loadPersonnel(company_id);

        this.setState({
            errors        : {},
            lead          : {
                id                    : id,
                assigned_company_id   : company_id,
                assigned_personnel_id : 0
            },
            showFormModal : true
        });
    }

    prepareAddActivity(id,company_id){
        this.loadPersonnel(company_id);

        this.setState({
            errors        : {},
            lead          : {
                id                    : id,
                assigned_company_id   : company_id,
                assigned_personnel_id : 0
            },
            showActivityModal : true
        });
    }

    hideFormModal(){
        this.setState({
            lead          : {},
            showFormModal : false
        });
    }

    hideActivityModal(){
        this.setState({
            lead          : {},
            showActivityModal : false
        });
    }

    submitForm(container){
        this.setState({
            errors : {}
        });
        const {lead,current_page,retrieve} = this.state;
        const config = {
            method: 'POST',
            url: `/api/leads/${lead.id}/assign-personnel`,
            data: {
                assigned_company_id   : lead.assigned_company_id,
                assigned_personnel_id : lead.assigned_personnel_id,
                _method               : 'PATCH'
            },
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        };

        axios(config)
            .then(
                (response) => {
                    this.hideFormModal();
                    container.success(
                        response.data.message,
                        'Success'
                    );
                    this.loadLeads(current_page,retrieve);
                    this.setState({
                        lead      : {},
                        personnel : [],
                        errors    : {}
                    });
                },
                (error) => {
                    this.setState({
                        errors : error.response.data.errors
                    });
                }
            );
    }

    formChange(field,value){
        let lead = Object.assign({}, this.state.lead);
        lead[field] = value;
        this.setState({lead : lead});
    }

    onChange(date) {
        let activity = Object.assign({}, this.state.activity);
        activity.activity_date = date;
        this.setState({activity : activity});
    }

    submitActivityForm(container){
        this.setState({
            errors : {}
        });
        const {lead,current_page,retrieve,activity} = this.state;
        activity.activity_date = moment(activity.activity_date).format('YYYY-MM-DD');
        const config = {
            method: 'POST',
            url: `/api/leads/${lead.id}/activities`,
            data: activity,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        };

        axios(config)
            .then(
                (response) => {
                    this.hideActivityModal();
                    container.success(
                        response.data.message,
                        'Leads Activity Created'
                    );
                    this.loadLeads(current_page,retrieve);
                    this.setState({
                        lead      : {},
                        personnel : [],
                        errors    : {}
                    });
                },
                (error) => {
                    this.setState({
                        errors : error.response.data.errors
                    });
                }
            );
    }

    formActivityChange(field,value){
        let activity = Object.assign({}, this.state.activity);
        activity[field] = value;
        this.setState({activity : activity});
    }

    prepareDeleteLead(lead){
        this.setState({
            lead            : lead,
            showDeleteModal : true
        });
    }

    hideDeleteModal(){
        this.setState({
            showDeleteModal: false
        });
    }

    deleteLead(id,container){
        axios({
            method: 'POST',
            url: `/api/leads/${id}`,
            data: {
                _method : 'DELETE'
            },
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                this.hideDeleteModal();
                container.success(
                    response.data.message,
                    'Success'
                );
                this.loadLeads();
            });
    }

    render() {
        let container;

        let {lead,leads,page_limit,current_page,last_page,page_start,page_end,retrieve,showFormModal,showActivityModal,personnel,errors,activity,showDeleteModal} = this.state;

        let start = ( current_page >= page_limit ? <Pagination.First onClick={() => this.loadLeads(1)}/> : '');

        let prev = ( (current_page != 1 && last_page > page_limit) ? <Pagination.Prev onClick={() => this.loadLeads((current_page-1),retrieve)}/> : '');

        let page_numbers = [];
        let pagination_numbers = [];
        for (var index = page_start; index <= page_end; index++) {
            const page = index;
            pagination_numbers.push(<Pagination.Item active={page == current_page} onClick={() => this.loadLeads(page,retrieve)}>{page}</Pagination.Item>);
            page_numbers.push((
                <li key={`page-${page}`} className={page == current_page ? 'active' : ''}>
                    <a href="javascript:void(0)" onClick={() => this.loadLeads(page,retrieve)}>{page}</a>
                </li>
            ));
        }

        let next = ( (current_page != page_end && last_page > page_limit)  ? <Pagination.Next onClick={() => this.loadLeads((current_page+1),retrieve)}/> : '');

        let end = ( (current_page != last_page && last_page > page_limit) ? <Pagination.Last onClick={() => this.loadLeads(last_page,retrieve)}/> : '');

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
                                                className={`nav-link${ retrieve == '' ? ' active' : '' }`}
                                                href="javascript:void(0)"
                                                onClick={() => this.setRetrieve('')}
                                            >
                                                All Leads
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link${ retrieve == 'latest_assigned' ? ' active' : '' }`}
                                                href="javascript:void(0)"
                                                onClick={() => this.setRetrieve('latest_assigned')}
                                            >
                                                Latest Leads
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link${ retrieve == 'rotten_leads' ? ' active' : '' }`}
                                                href="javascript:void(0)"
                                                onClick={() => this.setRetrieve('rotten_leads')}
                                            >
                                                Rotten Leads
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link${ retrieve == 'pending_bant' ? ' active' : '' }`}
                                                href="javascript:void(0)"
                                                onClick={() => this.setRetrieve('pending_bant')}
                                            >
                                                Pending BANT
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink
                                                className={`nav-link`}
                                                to={`/admin/logs`}
                                            >                                                                    
                                                Logs
                                            </NavLink>
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
                    <div className="col-md-12">
                        <div className="dash-sub-nav">
                            <ul className="nav nav-pills justify-content-center">
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setStage('Contact Made')}
                                    >
                                        <i className=""></i>
                                        Contact Made
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setStage('Meeting Arranged')}
                                    >
                                        <i className=""></i>
                                        Meeting Arranged
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setStage('Needs Defined')}
                                    >
                                        <i className=""></i>
                                        Needs Defined
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setStage('Proposal Made')}
                                    >
                                        <i className=""></i>
                                        Proposal Made
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setStage('Negotiations')}
                                    >
                                        <i className=""></i>
                                        Negotiations
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setStage('Won')}
                                    >
                                        <i className=""></i>
                                        Won
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className="nav-link"
                                        href="javascript:void(0)"
                                        onClick={() => this.setStage('Lost')}
                                    >
                                        <i className=""></i>
                                        Lost
                                    </a>
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
                                                <th scope="col">Lead</th>
                                                <th scope="col">Contact Person</th>
                                                <th scope="col">BANT</th>
                                                <th scope="col">Assignment</th>
                                                <th scope="col">Sales Personnel</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Date</th>
                                                <th scope="col">Options</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                leads.map(
                                                    lead => (
                                                        <tr key={ lead.id }>
                                                            <td>
                                                                <NavLink
                                                                    className="link-to-edit"
                                                                    to={`/admin/leads-in/${lead.id}/edit`}
                                                                >                                                                    
                                                                    { lead.company_name }
                                                                </NavLink>
                                                            </td>
                                                            <td>{ lead.contact_name }</td>
                                                            <td>{ lead.bant_value }</td>
                                                            <td>{ lead.assigned_company }</td>
                                                            <td>{ !isEmpty(lead.assigned_personnel) ? lead.assigned_personnel : '-' }</td>
                                                            <td>
                                                                <NavLink
                                                                    className="link-to-activities"
                                                                    to={`/admin/${lead.id}/activities`}
                                                                >
                                                                    { (lead.status == 'Leads-In' ? '' : lead.status) }
                                                                </NavLink>
                                                            </td>
                                                            <td>{ lead.company_assigned_date }</td>
                                                            <td>
                                                                <NavLink
                                                                    className="btn btn-info nav-link"
                                                                    to={`/admin/${lead.id}/activities`}
                                                                >
                                                                    <i className="icon-calendar"></i>
                                                                    <small>Activity</small>
                                                                </NavLink> &nbsp;
                                                                <NavLink
                                                                    className="btn btn-info nav-link"
                                                                    to={`/admin/leads-in/${lead.id}/edit`}
                                                                >
                                                                    <i className="icon-edit"></i>
                                                                    <small>Edit</small>
                                                                </NavLink> &nbsp;
                                                                <a
                                                                    className="btn btn-danger nav-link"
                                                                    href="#"
                                                                    onClick={() => this.prepareDeleteLead(lead)}
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
                    </div>

                    <div className="col-md-12 text-center">
                        <Pagination>
                            { start }
                            { prev }
                            { page_numbers }
                            { next }
                            { end }
                        </Pagination>
                    </div>

                    <Modal show={showFormModal} onHide={this.hideFormModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Assign Personnel</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body">
                            <form>
                                <div className="col-md-10 col-md-offset-1">
                                    <FormGroup
                                        controlId="assigned_personnel_id"
                                        validationState={this.formValidationState('assigned_personnel_id')}
                                    >
                                        <ControlLabel>Assigned To</ControlLabel>
                                        <FormControl
                                            componentClass="select"
                                            value={ lead.assigned_personnel_id }
                                            onChange={(event)=> this.formChange('assigned_personnel_id',event.target.value)}
                                            disabled={personnel.length == 0 ? true : false}
                                        >
                                            <option>Select Personnel</option>
                                            {
                                                personnel.map(
                                                    user => (
                                                        <option key={ user.id } value={ user.id }>{ user.name }</option>
                                                    )
                                                )
                                            }
                                        </FormControl>
                                        <HelpBlock>{ this.formValidationState('assigned_personnel_id') == 'error' ? errors.assigned_personnel_id[0] : '' }</HelpBlock>
                                    </FormGroup>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-default" onClick={this.hideFormModal}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={() => this.submitForm(container)}>Submit</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showActivityModal} onHide={this.hideActivityModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Add Activity</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body">
                            <form>
                                <div className="col-md-12">
                                    <FormGroup
                                        controlId="activity"
                                        validationState={this.formValidationState('activity')}
                                    >
                                        <ControlLabel>Choose Activity</ControlLabel>
                                        <FormControl
                                            componentClass="select"
                                            value={ activity.activity }
                                            onChange={(event)=> this.formActivityChange('activity',event.target.value)}
                                        >
                                            <option value="">Select Value</option>
                                            <option value="Call">Call</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Email">Email</option>
                                            <option value="Send Proposal">Send Proposal</option>
                                            <option value="Follow Up">Follow Up</option>
                                        </FormControl>
                                        <HelpBlock>{ this.formValidationState('activity') == 'error' ? errors.activity[0] : '' }</HelpBlock>
                                    </FormGroup>
                                    <ControlLabel>Choose Date</ControlLabel>
                                    <DatePickerInput
                                        onChange={this.onChange}
                                        value={activity.activity_date}
                                        className='my-custom-datepicker-component'
                                    />
                                    <FormGroup
                                        controlId="notes"
                                        validationState={this.formValidationState('notes')}
                                    >
                                        <ControlLabel>Notes</ControlLabel>
                                        <FormControl
                                            componentClass="textarea"
                                            value={activity.notes}
                                            onChange={(event)=> this.formActivityChange('notes',event.target.value)}
                                        />
                                        <HelpBlock>{ this.formValidationState('notes') == 'error' ? errors.notes[0] : '' }</HelpBlock>
                                    </FormGroup>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button type="button" className="btn btn-default" onClick={this.hideActivityModal}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={() => this.submitActivityForm(container)}>Add Activity</button>
                                 </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteModal} onHide={this.hideDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Delete Leads</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body text-center">
                            <h5>Are you sure want to delete this lead?</h5>
                            <h1>{ lead.company_name }</h1>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        onClick={this.hideDeleteModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => this.deleteLead(lead.id,container)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                </div>
            </div>
        );
    }
}

export default LeadsActive;
