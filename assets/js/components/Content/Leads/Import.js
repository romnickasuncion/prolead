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
            leads               : [],
            lead                : {},
            showDeleteModal     : false
        };
        this.fetchExcel          = this.fetchExcel.bind(this);
        this.formChange          = this.formChange.bind(this);
        this.prepareDeleteLead   = this.prepareDeleteLead.bind(this);
        this.hideDeleteModal     = this.hideDeleteModal.bind(this);
    }

    componentDidMount() {
    }

    fetchExcel({file}) {
        const formData = new FormData();
        formData.append('importFile', this.uploadInput.files[0]);
        axios({
            method: 'POST',
            url: `/api/leads/import`,
            data: formData,
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
        .then((response) => {
                this.setState({
                    leads: response.data.data
                });
        })
    }

    submitForm(container){
        let leads = this.state.leads;
        console.log(leads);
        axios({
            method: 'POST',
            url: `/api/leads/store`,
            data: {leads:leads},
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
        .then((response) => {
            container.success(
                response.data.message,
                'Success'
            );
        })
    }

    formChange(index,field,value){
        console.log(index + ':' + field);
        let leads = this.state.leads;
        leads[index][field] = value;
        this.setState({leads : leads});
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
            url: `/api/leads/${id}/delete`,
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
            });
    }

    render() {
            let {leads,lead,showDeleteModal} = this.state;
            let container;
            console.log(leads);
            const lead_elements = leads.map(
                                                (lead,index) => (
                                                    <tr key={ index }>
                                                        <td>
                                                            <input
                                                                key={`${index}-company_name`}
                                                                type="text"
                                                                name="company_name"
                                                                value={ lead.company_name }
                                                                onChange={(event)=> this.formChange(index,'company_name',event.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                key={`${index}-company_address`}
                                                                type="text"
                                                                name="company_address"
                                                                value={ lead.company_address }
                                                                onChange={(event)=> this.formChange(index,'company_address',event.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                key={`${index}-company_phone`}
                                                                type="text"
                                                                name="company_phone"
                                                                value={ lead.company_phone }
                                                                onChange={(event)=> this.formChange(index,'company_phone',event.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                key={`${index}-company_email`}
                                                                type="text"
                                                                name="company_email"
                                                                value={ lead.company_email }
                                                                onChange={(event)=> this.formChange(index,'company_email',event.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                key={`${index}-contact_name`}
                                                                type="text"
                                                                name="contact_name"
                                                                value={ lead.contact_name }
                                                                onChange={(event)=> this.formChange(index,'contact_name',event.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                key={`${index}-contact_phone`}
                                                                type="text"
                                                                name="contact_phone"
                                                                value={ lead.contact_phone }
                                                                onChange={(event)=> this.formChange(index,'contact_phone',event.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                key={`${index}-contact_email`}
                                                                type="text"
                                                                name="contact_email"
                                                                value={ lead.contact_email }
                                                                onChange={(event)=> this.formChange(index,'contact_email',event.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <a className="nav-link" href="#" onClick={() => this.prepareDeleteLead(lead)}><i className="icon-trash"></i></a>
                                                        </td>
                                                    </tr>
                                                )
                                            );

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
                                <div className="col-md-12">
                            <ul className="nav nav-pills">
                                <li className="nav-item"><a className="nav-link" href="#"><input className="form-control" ref={(ref) => { this.uploadInput = ref; }} type="file" id="file" name="file" /></a></li>
                                <li className="nav-item"><a className="nav-link" href="#"><button type="button" className="btn btn-primary" onClick={this.fetchExcel}>Fetch</button></a></li>
                                <li className="nav-item" className="pull-right"><a className="nav-link" href="#"><button type="button" className="btn btn-primary" onClick={() => this.submitForm(container)}>Submit</button></a></li>
                            </ul>
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
                                                    Company
                                                </th>
                                                <th scope="col">Company Address</th>
                                                <th scope="col">Company Phone</th>
                                                <th scope="col">Company Email</th>
                                                <th scope="col">Contact Name</th>
                                                <th scope="col">Contact Phone</th>
                                                <th scope="col">Contact Email</th>
                                                <th scope="col">Options</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lead_elements}
                                        </tbody>
                                    </table>
                                </div>
                            </Animated>
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
                                        onClick={() => this.deleteLead(lead.company_name,container)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>

                    </div>
                </div>
            </div>
        );
    }
}

export default Import;
