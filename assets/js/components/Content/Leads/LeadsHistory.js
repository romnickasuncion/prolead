import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import ReactTooltip from 'react-tooltip'
import { isEmpty,has } from 'lodash';

class LeadsHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activities : [],
            activity   : [],
            lead       : {}
        };
    }

    componentDidMount() {
        if(has(this.props.match,'params') && has(this.props.match.params,'id')){
                    console.log(this.props.match.params.id);
            this.loadActivity(this.props.match.params.id);
        }
    }

    loadActivity(id) {
        console.log(id);

        axios({
            method: 'GET',
            url: `/api/leads/${id}/activities`,
            headers: {'Authorization' : `Bearer ${this.props.logged_user.token}`}
        })
            .then((response) => {
                this.setState({
                    activities: response.data.data
                });
            })

    }

render() {
    let {activity, activities} = this.state;
        return (
            <div>
                <Animated animationIn="fadeIn">
                    <div className="sub-nav-wrap">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6">
                                    <h4>&nbsp;&nbsp;Activity History</h4>
                                </div>
                                <div className="col-md-6">
                                    <div className="pull-right">
                                        <ul className="list-inline">
                                            <li><a href="#" className="btn btn-primary">Add New Activity</a></li>
                                        </ul>
                                    </div>
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
                                    {
                                        activities.map(
                                            activity => (
                                                <div className="col-md-4" key={ activity.id }>
                                                    <div className="leads-history-card">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <p>Activity</p>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <p className="pull-right"><span> { activity.activity } </span></p>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <p>Activity Date</p>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <p className="pull-right"> { activity.activity_date } </p>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-12 leads-history-note">
                                                                <h5>Note</h5>
                                                                    <p> { activity.notes } </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    }
                                </div>
                            </Animated>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default LeadsHistory;