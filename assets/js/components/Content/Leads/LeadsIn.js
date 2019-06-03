import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { Modal,FormGroup,FormControl,HelpBlock,ControlLabel,Pagination,Glyphicon } from 'react-bootstrap';
import { ToastContainer } from 'react-toastr';
import { isEmpty,has,findIndex,merge,omit } from 'lodash';
import { NavLink } from 'react-router-dom';

class LeadsIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leads               : [],
            lead                : {},
            companies           : [],
            resellers           : [],
            personnel           : [],
            showDeleteModal     : false,
            showFormModal       : false,
            updateForm          : false,
            errors              : {},
            page_limit          : 10,
            current_page        : 1,
            last_page           : 0,
            page_start          : 0,
            page_end            : 0,
            retrieve            : '',
            check_all           : false,
            assignment_ids      : [],
            showMassDeleteModal : false,
            showMassEditModal   : false
        };

        this.formChange          = this.formChange.bind(this);
        // this.submitForm          = this.submitForm.bind(this);
        this.prepareAddLead      = this.prepareAddLead.bind(this);
        this.prepareEditLead     = this.prepareEditLead.bind(this);
        this.prepareDeleteLead   = this.prepareDeleteLead.bind(this);
        this.hideFormModal       = this.hideFormModal.bind(this);
        this.hideDeleteModal     = this.hideDeleteModal.bind(this);
        this.deleteLead          = this.deleteLead.bind(this);
        this.hideMassDeleteModal = this.hideMassDeleteModal.bind(this);
        this.massDeleteLead      = this.massDeleteLead.bind(this);
        this.hideMassEditModal   = this.hideMassEditModal.bind(this);
    }

    componentDidMount() {
        this.loadLeads(1);
        if(this.props.logged_user.role_id == 1){
            this.loadCompanies('parent_only');
        }

        if(this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3){
            this.loadCompanies('child_only');
            // this.loadPersonnel(this.props.logged_user.company_id);
        }
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
                if(fetch == 'parent_only'){
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

    loadLeads(page,retrieve = ''){
        axios({
            method: 'GET',
            url: `/api/leads?page=${page}&lead=unassigned${retrieve != '' ? `&retrieve=${retrieve}` : ''}`,
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

    processLeadBeforeSubmit(lead){
        let will_submit_lead = lead;

        if(will_submit_lead.parent_company_id > 0){
            will_submit_lead.assigned_company_id = will_submit_lead.parent_company_id;
        }

        if(will_submit_lead.child_company_id > 0){
            will_submit_lead.assigned_company_id = will_submit_lead.child_company_id;
        }

        return this.processPersonnelId(will_submit_lead);
    }

    processPersonnelId(lead){
        if(lead.assigned_personnel_id == '' || lead.assigned_personnel_id == 0){
            lead = omit(lead,['assigned_personnel_id']);
        }
        return lead;
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

    formValidationState(field){
        const errors = this.state.errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
    }

    /** Related to Create and Updating Records */
    setRetrieve(value){
        this.loadLeads(1,value);
        this.setState({
            retrieve : value
        });
    }

    prepareAddLead(lead){
        if(this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3){
            this.loadPersonnel(this.props.logged_user.company_id);
        }

        this.setState({
            lead          : {},
            showFormModal : true
        });
    }

    prepareEditLead(lead){
        this.loadPersonnel(lead.assigned_company_id);

        this.setState({
            lead          : lead,
            showFormModal : true,
            updateForm    : true
        });
    }

    hideFormModal(){
        this.setState({
            lead          : {},
            showFormModal : false,
            updateForm    : false
        });
    }
    /** End of Related to Create and Updating Records */

    /** Related to Deleting Records */
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
    /** End of Related to Deleting Records */

    /** Related to Mass Assignment Edit and Delete Records */
    massCheck(){
        let {leads,check_all}         = this.state;
        const change_check_all_status = check_all ? false : true;
        const assignment_ids          = [];

        leads.forEach(function(value,index){
            leads[index].checked = change_check_all_status;
            assignment_ids.push(leads[index].id);
        });

        this.setState({
            leads          : leads,
            check_all      : change_check_all_status,
            assignment_ids : assignment_ids
        });
    }

    hideMassDeleteModal(){
        this.setState({
            showMassDeleteModal: false
        });
    }

    massDeleteLead(container){
        axios({
            method: 'POST',
            url: `/api/leads`,
            data: {
                ids     : this.state.assignment_ids,
                _method : 'DELETE'
            },
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                this.hideMassDeleteModal();
                container.success(
                    response.data.message,
                    'Success'
                );
                this.loadLeads();

                this.setState({
                    check_all      : false,
                    assignment_ids : []
                });
            });
    }

    checkLead(id){
        let {leads,assignment_ids} = this.state;
        leads.forEach(function(lead,index){
            if(lead.id  == id){
                const change_check_status = lead.checked ? false : true;
                leads[index].checked      = lead.checked ? false : true;

                if(change_check_status){
                    assignment_ids.push(id);
                } else {
                    const assignment_ids_index = findIndex(assignment_ids, function(value) { return value == id; });
                    assignment_ids.splice(assignment_ids_index);
                }
            }
        });

        this.setState({
            leads          : leads,
            assignment_ids : assignment_ids
        });
    }

    hideMassEditModal(){
        this.setState({
            lead              : {},
            showMassEditModal : false,
            personnel         : [],
            errors            : {}
        });
    }

    massUpdateLead(container){
        this.setState({
            errors : {}
        });
        const {assignment_ids,lead} = this.state;
        const config = {
            method: 'POST',
            url: `/api/leads`,
            data: merge(
                {},
                {
                    ids : assignment_ids,
                    _method : 'PATCH'
                },
                this.processLeadBeforeSubmit(lead)
            ),
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
                    this.loadLeads();
                    this.setState({
                        lead              : {},
                        personnel         : [],
                        assignment_ids    : [],
                        showMassEditModal : false,
                        check_all         : false
                    });
                },
                (error) => {
                    this.setState({
                        errors : error.response.data.errors
                    });
                }
            );
    }
    /** End of Related to Mass Assignment Edit and Delete Records */

    render() {
        let container;
        let {leads,lead,companies,resellers,personnel,showDeleteModal,showFormModal,updateForm,errors,page_limit,current_page,last_page,page_start,page_end,retrieve,showMassDeleteModal,check_all,showMassEditModal,assignment_ids} = this.state;

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
                                    {
                                        this.props.logged_user.role_id == 1
                                        ?
                                            (
                                                <ul className="nav nav-pills">
                                                    <li className="nav-item">
                                                        <NavLink to='/admin/leads-in/add'
                                                            className="nav-link">                                                        
                                                            <i className="icon-circle-plus"></i>New
                                                        </NavLink>
                                                    </li>
                                                    <li className="nav-item">
                                                        <NavLink to='/admin/leads-in/import'
                                                            className="nav-link">
                                                            <i className="icon-cloud-download"></i>
                                                            Import from Excel
                                                        </NavLink>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a
                                                            className="nav-link"
                                                            href="javascript:void(0)"
                                                            onClick={() => this.setState({showMassEditModal:true})}
                                                        >
                                                            <i className="icon-edit"></i>Edit
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
                                            )
                                        : ''
                                    }
                                </div>

                                <div className="col-md-4">
                                    <form className="pull-right">
                                        <input type="text" placeholder="Search" />
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
                                                        onClick={() => this.massCheck()}
                                                        checked={ check_all }
                                                    />
                                                    &nbsp;Lead
                                                </th>
                                                <th scope="col">Lead Address</th>
                                                <th scope="col">Lead Phone</th>
                                                <th scope="col">Contact Name</th>
                                                <th scope="col">Contact Number</th>
                                                <th scope="col">Option</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                leads.map(
                                                    lead => (
                                                        <tr key={ lead.id }>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={ lead.checked }
                                                                    onClick={() => this.checkLead(lead.id)}
                                                                />
                                                                &nbsp;{ lead.company_name }
                                                            </td>
                                                            <td>{ lead.company_address }</td>
                                                            <td>{ lead.company_phone }</td>
                                                            <td>{ lead.contact_name }</td>
                                                            <td>{ lead.contact_phone }</td>
                                                            <td>
                                                                <NavLink
                                                                    className="btn btn-info nav-link"
                                                                    to={`/admin/leads-in/${lead.id}/edit`}
                                                                >
                                                                    <i className="icon-edit"></i>
                                                                    <small>Edit</small>
                                                                </NavLink>
                                                                <a
                                                                    className="btn btn-danger nav-link"
                                                                    href="javascript:void(0)"
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

                        <div className="col-md-12 text-center">
                            <Pagination>
                                { start }
                                { prev }
                                { page_numbers }
                                { next }
                                { end }
                            </Pagination>
                        </div>
                    </div>

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

                    <Modal show={showMassDeleteModal} onHide={this.hideMassDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Delete Leads</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body text-center">
                            <h5>Are you sure want to delete this leads?</h5>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        onClick={this.hideMassDeleteModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => this.massDeleteLead(container)}
                                        disabled={isEmpty(assignment_ids) ? true : false}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showMassEditModal} onHide={this.hideMassEditModal}>
                        <Modal.Header closeButton>
                            <Modal.Title bsClass="modal-title text-center">Mass Update Leads</Modal.Title>
                        </Modal.Header>
                        <Modal.Body bsClass="modal-body">
                            <div className="row">
                                <form>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            {
                                                this.props.logged_user.role_id == 1
                                                ?
                                                    <div className="col-md-6">
                                                        <FormGroup
                                                            controlId="parent_company_id"
                                                            validationState={this.formValidationState('parent_company_id')}
                                                        >
                                                            <ControlLabel>Assigned Company</ControlLabel>
                                                            <FormControl
                                                                componentClass="select"
                                                                value={ lead.parent_company_id }
                                                                onChange={(event)=> this.formChange('parent_company_id',event.target.value)}
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
                                                            <HelpBlock>{ this.formValidationState('parent_company_id') == 'error' ? errors.assigned_company_id[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                    </div>
                                                : ''
                                            }
                                            <div className="col-md-6">
                                                <FormGroup
                                                    controlId="child_company_id"
                                                    validationState={this.formValidationState('child_company_id')}
                                                >
                                                    <ControlLabel>Reseller</ControlLabel>
                                                    <FormControl
                                                        componentClass="select"
                                                        value={ lead.child_company_id }
                                                        onChange={(event)=> this.formChange('child_company_id',event.target.value)}
                                                        disabled={resellers.length == 0 ? true : false}
                                                    >
                                                        <option selected value="">Select Reseller</option>
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
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-md-6">
                                                <FormGroup
                                                    controlId="assigned_personnel_id"
                                                    validationState={this.formValidationState('assigned_personnel_id')}
                                                >
                                                    <ControlLabel>Assigned Personnel</ControlLabel>
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
                                            <div className="col-md-6">
                                                <FormGroup
                                                    controlId="note"
                                                    validationState={this.formValidationState('note')}
                                                >
                                                    <ControlLabel>Note</ControlLabel>
                                                    <FormControl
                                                        componentClass="textarea"
                                                        value={lead.note}
                                                        onChange={(event)=> this.formChange('note',event.target.value)}
                                                    />
                                                    <HelpBlock>{ this.formValidationState('note') == 'error' ? errors.note[0] : '' }</HelpBlock>
                                                </FormGroup>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </Modal.Body>
                        <Modal.Footer bsClass="modal-footer text-center">
                            <div className="row">
                                <div className="col-md-12">
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        onClick={this.hideMassEditModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => this.massUpdateLead(container)}
                                        disabled={(isEmpty(lead) || isEmpty(assignment_ids)) ? true : false}
                                    >
                                        Update
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

export default LeadsIn;
