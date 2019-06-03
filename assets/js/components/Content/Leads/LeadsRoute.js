import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import LeadsAll from './LeadsIn';
import LeadsAdd from './LeadsAdd';
import Import from './Import';
import Logs from './Logs';

        // <Route path='/admin/leads-in/add' render={(props) => <UserDetail {...props} user={user}/>}/>
const LeadsRoute = ({logged_user}) => (
    <Switch>
        <Route
            exact
            path='/admin/leads-in'
            render={() => <LeadsAll logged_user={logged_user}/>}
        />
        <Route
            path='/admin/leads-in/add'
            render={() => <LeadsAdd logged_user={logged_user}/>}
        />
        <Route
            path='/admin/leads-in/:id/edit'
            render={(props) => <LeadsAdd {...props} logged_user={logged_user}/>}
        />
        <Route
            path='/admin/leads-in/import'
            render={() => <Import logged_user={logged_user}/>}
        />
        <Route
            path='/admin/leads-in/logs'
            render={() => <Logs logged_user={logged_user}/>}
        />        
    </Switch>
)


export default LeadsRoute;
