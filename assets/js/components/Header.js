import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import ReactTooltip from 'react-tooltip'

const Header = ({logged_user,logout}) => (
    <nav className="gtco-nav" role="navigation">
        <div className="container">
            <div className="row">
                <div className="col-md-3 pull-right text-right">
                    <span className="label label-default">
                        Welcome, {logged_user.name}!
                        <a href="javascript:void(0)" className="logout" onClick={()=> logout({})}>
                            Logout&nbsp;<i className="icon-log-out"></i>
                        </a>
                    </span>
                </div>
            </div>
            <div className="row">
                <div className="col-md-3 pull-right text-right">                    
                    <span className="label label-default">
                        Logged-in as {logged_user.role_id == 1 ? ' Master Admin' :'' }{logged_user.role_id == 2 ? ' Company Admin' :'' }{logged_user.role_id == 3 ? ' Company User' :'' }{logged_user.role_id == 4 ? ' Reseller Admin' :'' }{logged_user.role_id == 5 ? ' Reseller Staff' :'' }                                                                                                          
                    </span>                    
                </div>
            </div>
            <div className="row">
                <div className="col-xs-2 text-left">
                    <div id="gtco-logo"><NavLink to='/admin'><img src={`${window.location.origin}/images/logo.png`} /></NavLink></div>
                </div>
                <div className="col-xs-10 text-right menu-1">
                    <ul>
                        <li data-tip="tooltip" title="Overview">
                            <NavLink to='/admin/overview' activeClassName="active">Overview</NavLink>
                        </li>
                        <li data-tip="tooltip" title="Leads-In">
                            <NavLink to='/admin/leads-in' activeClassName="active">Leads In</NavLink>
                        </li>
                        <li data-tip="tooltip" title="Active Leads">
                            <NavLink to='/admin/active-leads' activeClassName="active">Active Leads</NavLink>
                        </li>
                        {
                            logged_user.role_id == 1
                            ?
                                <li  data-tip="tooltip" title="Companies">
                                    <NavLink to='/admin/customers' activeClassName="active">Companies</NavLink>
                                </li>
                            : ''
                        }
                        {
                            logged_user.role_id == 1 || logged_user.role_id == 2 || logged_user.role_id == 3
                            ?
                                <li data-tip="tooltip" title="Resellers">
                                    <NavLink to='/admin/resellers' activeClassName="active">Resellers</NavLink>
                                </li>
                            : ''
                        }
                        {
                            logged_user.role_id != 5
                            ?
                                <li data-tip="tooltip" title="Users">
                                    <NavLink to='/admin/users' activeClassName="active">User Accounts</NavLink>
                                </li>
                            : ''
                        }
                    </ul>
                </div>
            </div>
        </div>
    </nav>
)

export default Header;