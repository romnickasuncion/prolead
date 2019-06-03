import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer } from 'react-toastr';
import { Modal,FormGroup,FormControl,HelpBlock,ControlLabel,Pagination,Glyphicon } from 'react-bootstrap';
import {Animated} from 'react-animated-css';
import moment from 'moment';
import { isEmpty,has,findIndex,merge,omit } from 'lodash';
import { Redirect,NavLink } from 'react-router-dom';
import { DatePicker, DatePickerInput } from 'rc-datepicker';
import 'rc-datepicker/lib/style.css';

class LeadsAdd extends Component {
    constructor (props) {
        super(props);

        this.state = {
            lead: {
                company_name         : '',
                company_address      : '',
                company_phone        : '',
                company_email        : '',
                contact_name         : '',
                contact_phone        : '',
                contact_email        : '',
                note                 : '',
                budget               : 0,
                authority            : 0,
                need                 : 0,
                timeframe            : 0,
                bant_value           : 0,
                budget_closing_date  : new Date(),
                timeframe_start_date : new Date(),
                timeframe_end_date   : new Date()
            },
            companies: [],
            resellers: [],
            personnel: [],
            errors: {},
            success: false
        };

        this.submitForm          = this.submitForm.bind(this);
    }

    componentDidMount() {
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

    loadLead(id){
        axios({
            method: 'GET',
            url: `/api/leads/${id}`,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                let lead = response.data.data;

                if (!isEmpty(lead.company)) {
                    lead.parent_company_id = lead.company.parent_company_id == 0 ? lead.company.id : lead.company.parent_company_id;
                    lead.child_company_id = lead.company.parent_company_id == 0 ? 0 : lead.company.id;
                    lead.assigned_company_id = lead.company.parent_company_id == 0 ? lead.company.parent_company_id : lead.company.id;

                    if(lead.parent_company_id != 0){
                        this.loadCompanies('child_only',`&company_id=${lead.parent_company_id}`);
                    }

                    if(lead.child_company_id != 0){
                        this.loadPersonnel(lead.child_company_id);
                    }
                }

                lead.budget_closing_date  = new Date(lead.budget_closing_date);
                lead.timeframe_start_date = new Date(lead.timeframe_start_date);
                lead.timeframe_end_date   = new Date(lead.timeframe_end_date);

                this.setState({lead: lead});
            });
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

    formChange(field,value){
        let lead = Object.assign({}, this.state.lead);
        lead[field] = value;
        lead.budget = 0;
        lead.authority = 0;
        lead.need = 0;
        lead.timeframe = 0;

        if(field == 'parent_company_id'){
            this.setState({
                personnel: [],
                resellers: [],
            });
            this.loadCompanies('child_only',`&company_id=${value}`);
            lead.assigned_company_id = value;
            lead = omit(lead,['assigned_personnel_id']);
        }

        if(field == 'child_company_id'){
            this.setState({
                personnel: []
            });
            this.loadPersonnel(value);
            lead.assigned_company_id = value;
            lead = omit(lead,['assigned_personnel_id']);
        }

        if((has(lead,'budget_amount') && !isEmpty(lead.budget_amount)) && moment(lead.budget_closing_date).isValid()){
            lead.budget = 1;
        }

        if((has(lead,'authority_name') && !isEmpty(lead.authority_name)) && (has(lead,'authority_title') && !isEmpty(lead.authority_title))){
            lead.authority = 1;
        }

        if((has(lead,'need_urgency') && !isEmpty(lead.need_urgency)) && (has(lead,'need_reason') && !isEmpty(lead.need_reason))){
            lead.need = 1;
        }

        if((moment(lead.timeframe_start_date).isValid() && moment(lead.timeframe_end_date).isValid() && !isEmpty(lead.timeframe_reason))){
            lead.timeframe = 1;
        }

        this.setState({lead : lead});
    }

    formValidationState(field){
        const errors = this.state.errors;
        return !isEmpty(errors) && has(errors,field) ? 'error' : null;
    }

    processLeadBeforeSubmit(lead){
        let will_submit_lead = lead;

/*        if(will_submit_lead.parent_company_id > 0){
            will_submit_lead.assigned_company_id = will_submit_lead.parent_company_id;
        } else if(will_submit_lead.child_company_id > 0){
            will_submit_lead.assigned_company_id = will_submit_lead.child_company_id;
        } else {
            will_submit_lead = omit(lead,['assigned_company_id']);
        }*/

        if(will_submit_lead.parent_company_id == 0 && will_submit_lead.child_company_id == 0){
            will_submit_lead = omit(will_submit_lead,['assigned_company_id']);
        }

        if(will_submit_lead.timeframe_duration == null){
            will_submit_lead = omit(will_submit_lead,['timeframe_duration']);
        }

        if(will_submit_lead.need_urgency == null){
            will_submit_lead = omit(will_submit_lead,['need_urgency']);
        }

        if(will_submit_lead.need_reason == null){
            will_submit_lead = omit(will_submit_lead,['need_reason']);
        }

        if(will_submit_lead.timeframe_reason == null){
            will_submit_lead = omit(will_submit_lead,['timeframe_reason']);
        }

        if(will_submit_lead.budget_amount == null || will_submit_lead.budget_amount == 0|| will_submit_lead.budget_amount == ""){
            will_submit_lead = omit(will_submit_lead,['budget_amount']);
        }

        if(moment(will_submit_lead.timeframe_end_date).isValid()){
            will_submit_lead.timeframe_end_date = moment(will_submit_lead.timeframe_end_date).format('YYYY-MM-DD');
        } else {
            will_submit_lead = omit(will_submit_lead,['timeframe_end_date']);
        }

        if(moment(will_submit_lead.timeframe_start_date).isValid()){
            will_submit_lead.timeframe_start_date = moment(will_submit_lead.timeframe_start_date).format('YYYY-MM-DD');
        } else {
            will_submit_lead = omit(will_submit_lead,['timeframe_start_date']);
        }

        if(moment(will_submit_lead.budget_closing_date).isValid()){
            will_submit_lead.budget_closing_date = moment(will_submit_lead.budget_closing_date).format('YYYY-MM-DD');
        } else {
            will_submit_lead = omit(will_submit_lead,['budget_closing_date']);
        }

        will_submit_lead.bant_value = will_submit_lead.budget + will_submit_lead.authority + will_submit_lead.need + will_submit_lead.timeframe;
        return this.processPersonnelId(will_submit_lead);
    }

    processPersonnelId(lead){
        if(lead.assigned_personnel_id == '' || lead.assigned_personnel_id == 0){
            lead = omit(lead,['assigned_personnel_id']);
        }
        return lead;
    }

    submitForm(container){
        this.setState({
            errors : {}
        });

        const {lead} = this.state;

        const has_id = has(lead,'id');
        if (!has_id) {
            lead.status = 'Leads-In';
        }

        const config = {
            method: 'POST',
            url: `/api/leads${(has_id ? `/${lead.id}` : '')}`,
            data: this.processLeadBeforeSubmit(lead),
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        };

        if(has_id){
            config.data._method = 'PATCH'
        }

        axios(config)
            .then(
                (response) => {
                    container.success(
                        `Successfully ${(has_id ? 'updated' : 'created')} lead`,
                        'Success'
                    );
                    setTimeout(() => this.setState({ success: true }), 1500)
                },
                (error) => {
                    this.setState({
                        errors : error.response.data.errors
                    });
                }
            );
    }

    render(){
        let container;
        const {logged_user} = this.props;
        const {
            lead,
            companies,
            resellers,
            personnel,
            errors,
            success
        } = this.state;

        if(success){
            return <Redirect to="/admin/active-leads" />;
        }

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
                                <div className="col-md-12" >
                                    <b data-tip="tooltip" title="BANT is a way to establish the necessary data for any btb sales. B stands for Budget, A stands for Authority, N stands for Need and T stands for Timeframe.">TOTAL BANT SCORE: {lead.bant_value}</b> <NavLink to='/admin/leads-in' className="pull-right" activeClassName="active"><i className="icon-chevron-left"></i> Back to Leads In</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </Animated>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <Animated animationIn="fadeInUp">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="panel panel-default">
                                                    <div className="panel-heading">Leads Information</div>
                                                    <div className="panel-body">
                                                        <FormGroup
                                                            controlId="company_name"
                                                            validationState={this.formValidationState('company_name')}
                                                        >
                                                            <ControlLabel>Company Name</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                value={lead.company_name}
                                                                onChange={(event)=> this.formChange('company_name',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('company_name') == 'error' ? errors.company_name[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="company_address"
                                                            validationState={this.formValidationState('company_address')}
                                                        >
                                                            <ControlLabel>Company Address</ControlLabel>
                                                            <FormControl
                                                                componentClass="textarea"
                                                                value={lead.company_address}
                                                                onChange={(event)=> this.formChange('company_address',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('company_address') == 'error' ? errors.company_address[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="company_phone"
                                                            validationState={this.formValidationState('company_phone')}
                                                        >
                                                            <ControlLabel>Company Phone</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                value={lead.company_phone}
                                                                onChange={(event)=> this.formChange('company_phone',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('company_phone') == 'error' ? errors.company_phone[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="company_email"
                                                            validationState={this.formValidationState('company_email')}
                                                        >
                                                            <ControlLabel>Company Email</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                value={lead.company_email}
                                                                onChange={(event)=> this.formChange('company_email',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('company_email') == 'error' ? errors.company_email[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="contact_name"
                                                            validationState={this.formValidationState('contact_name')}
                                                        >
                                                            <ControlLabel>Contact Name</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                value={lead.contact_name}
                                                                onChange={(event)=> this.formChange('contact_name',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('contact_name') == 'error' ? errors.contact_name[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="contact_phone"
                                                            validationState={this.formValidationState('contact_phone')}
                                                        >
                                                            <ControlLabel>Contact Phone</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                value={lead.contact_phone}
                                                                onChange={(event)=> this.formChange('contact_phone',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('contact_phone') == 'error' ? errors.contact_phone[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="contact_email"
                                                            validationState={this.formValidationState('contact_email')}
                                                        >
                                                            <ControlLabel>Contact Email</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                value={lead.contact_email}
                                                                onChange={(event)=> this.formChange('contact_email',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('contact_email') == 'error' ? errors.contact_email[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="note"
                                                        >
                                                            <ControlLabel>Note</ControlLabel>
                                                            <FormControl
                                                                componentClass="textarea"
                                                                value={lead.note}
                                                                onChange={(event)=> this.formChange('note',event.target.value)}
                                                            />
                                                            <HelpBlock></HelpBlock>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                                <div className="panel panel-default">
                                                    <div className="panel-heading">Assignment Information</div>
                                                    <div className="panel-body">
                                                        {
                                                            logged_user.role_id == 1
                                                            ?
                                                                <FormGroup
                                                                    controlId="parent_company_id"
                                                                    validationState={this.formValidationState('parent_company_id')}
                                                                >
                                                                    <ControlLabel>Company</ControlLabel>
                                                                    <FormControl
                                                                        componentClass="select"
                                                                        value={ lead.parent_company_id }
                                                                        onChange={(event)=> this.formChange('parent_company_id',event.target.value)}
                                                                    >
                                                                        <option value="">Select Company</option>
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
                                                            : ''
                                                        }
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
                                                                <option value="">Select Reseller</option>
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
                                                                <option value="">Select Personnel</option>
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
                                                </div>
                                                <div className="panel panel-default">
                                                    <div className="panel-heading">Lead Stage</div>
                                                    <div className="panel-body">
                                                    <FormGroup
                                                            controlId="need_urgency"
                                                        >
                                                            <FormControl
                                                                componentClass="select"
                                                                value={ lead.status }
                                                                onChange={(event)=> this.formChange('status',event.target.value)}
                                                            >
                                                                <option key="stage-leads-in" value="Leads-In">Select Stage</option>
                                                                {
                                                                    has(lead,'id')
                                                                    ?
                                                                    (
                                                                        [
                                                                            <option key="stage-contact-made" value="Contact Made">Contact Made</option>,
                                                                            <option key="stage-meeting-arranged" value="Meeting Arranged">Meeting Arranged</option>,
                                                                            <option key="stage-needs-defined" value="Needs Defined">Needs Defined</option>,
                                                                            <option key="stage-proposal-made" value="Proposal Made">Proposal Made</option>,
                                                                            <option key="stage-negotiations" value="Negotiations">Negotiations</option>,
                                                                            <option key="stage-won" value="Won">Won</option>,
                                                                            <option key="stage-lost" value="Lost">Lost</option>,
                                                                            <option key="stage-rotten" value="Rotten">Rotten</option>
                                                                        ]
                                                                    )
                                                                    :''
                                                                }
                                                            </FormControl>
                                                            <HelpBlock>{ this.formValidationState('status') == 'error' ? errors.status[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="panel panel-default">
                                                    <div className="panel-heading">Budget</div>
                                                    <div className="panel-body">
                                                        <FormGroup
                                                            controlId="budget_amount"
                                                            validationState={this.formValidationState('budget_amount')}
                                                        >
                                                            <ControlLabel>Amount</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                value={lead.budget_amount}
                                                                onChange={(event)=> this.formChange('budget_amount',event.target.value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('budget_amount') == 'error' ? errors.budget_amount[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="budget_closing_date"
                                                            validationState={this.formValidationState('budget_closing_date')}
                                                        >
                                                            <ControlLabel>Closing Date</ControlLabel>
                                                            <DatePickerInput
                                                                className='my-custom-datepicker-component'
                                                                value={lead.budget_closing_date}
                                                                onChange={(value)=> this.formChange('budget_closing_date',value)}
                                                            />
                                                        </FormGroup>
                                                            <HelpBlock>{ this.formValidationState('budget_closing_date') == 'error' ? errors.budget_closing_date[0] : '' }</HelpBlock>
                                                    </div>
                                                </div>
                                                <div className="panel panel-default">
                                                    <div className="panel-heading">Authority</div>
                                                    <div className="panel-body">
                                                        <FormGroup
                                                            controlId="authority_name"
                                                        >
                                                            <ControlLabel>Name</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                onChange={(event)=> this.formChange('authority_name',event.target.value)}
                                                                value={lead.authority_name}
                                                            />
                                                            <HelpBlock></HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="authority_title"
                                                        >
                                                            <ControlLabel>Title</ControlLabel>
                                                            <FormControl
                                                                type="text"
                                                                onChange={(event)=> this.formChange('authority_title',event.target.value)}
                                                                value={lead.authority_title}
                                                            />
                                                            <HelpBlock></HelpBlock>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                                <div className="panel panel-default">
                                                    <div className="panel-heading">Need</div>
                                                    <div className="panel-body">
                                                        <FormGroup
                                                            controlId="need_urgency"
                                                        >
                                                            <ControlLabel>Urgency</ControlLabel>
                                                            <FormControl
                                                                componentClass="select"
                                                                onChange={(event)=> this.formChange('need_urgency',event.target.value)}
                                                                value={ lead.need_urgency }
                                                            >
                                                                <option key="need_urgency-select" value="">Select Urgency</option>
                                                                <option key="need_urgency-select-yes" value="yes">Yes</option>
                                                                <option key="need_urgency-select-no" value="no">No</option>
                                                                <option key="need_urgency-select-later" value="later">Later</option>
                                                            </FormControl>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="need_reason"
                                                        >
                                                            <ControlLabel>Reason</ControlLabel>
                                                            <FormControl
                                                                componentClass="textarea"
                                                                value={lead.need_reason}
                                                                onChange={(event)=> this.formChange('need_reason',event.target.value)}
                                                            />
                                                            <HelpBlock></HelpBlock>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                                <div className="panel panel-default">
                                                    <div className="panel-heading">Timeframe</div>
                                                    <div className="panel-body">
                                                        <FormGroup
                                                            controlId="timeframe_start_date"
                                                            validationState={this.formValidationState('timeframe_start_date')}
                                                        >
                                                            <ControlLabel>Start Date</ControlLabel>
                                                            <DatePickerInput
                                                                className='my-custom-datepicker-component'
                                                                value={lead.timeframe_start_date}
                                                                onChange={(value)=> this.formChange('timeframe_start_date',value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('timeframe_start_date') == 'error' ? errors.timeframe_start_date[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="timeframe_end_date"
                                                            validationState={this.formValidationState('timeframe_end_date')}
                                                        >
                                                            <ControlLabel>End Date</ControlLabel>
                                                            <DatePickerInput
                                                                className='my-custom-datepicker-component'
                                                                value={lead.timeframe_end_date}
                                                                onChange={(value)=> this.formChange('timeframe_end_date',value)}
                                                            />
                                                            <HelpBlock>{ this.formValidationState('timeframe_end_date') == 'error' ? errors.timeframe_end_date[0] : '' }</HelpBlock>
                                                        </FormGroup>
                                                        <FormGroup
                                                            controlId="timeframe_reason"
                                                        >
                                                            <ControlLabel>Reason</ControlLabel>
                                                            <FormControl
                                                                componentClass="textarea"
                                                                value={lead.timeframe_reason}
                                                                onChange={(event)=> this.formChange('timeframe_reason',event.target.value)}
                                                            />
                                                            <HelpBlock></HelpBlock>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-lg center-block"
                                            onClick={() => this.submitForm(container)}
                                        >
                                            { !has(lead,'id') ? `Create` : `Update` }
                                        </button>
                                    </div>
                                </div>
                            </Animated>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LeadsAdd;