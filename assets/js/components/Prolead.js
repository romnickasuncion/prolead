import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route } from 'react-router-dom';
import { isEmpty, has } from 'lodash';
import Header from './Header';
import Footer from './Footer';
import Overview from './Content/Overview/Overview';
import LeadsRoute from './Content/Leads/LeadsRoute';
import LeadsActive from './Content/Leads/LeadsActive';
import CustomersAll from './Content/Dealers/CustomersAll';
import ResellersAll from './Content/Dealers/ResellersAll';
import Import from './Content/Leads/Import';
import Users from './Content/Users/Users';
import Activity from './Content/Leads/Activity';
import History from './Content/Leads/LeadsHistory';
import Login from './Content/Login';
import Logs from './Content/Leads/Logs';

class Prolead extends Component {

    constructor(props) {
        super(props);
        this.state = {
            logged_user : !isEmpty(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user')) : {}
        };
    }

    redirection(){
        const {logged_user} = this.state;
        const {pathname}    = this.props.location;

        if(!isEmpty(logged_user) && pathname == '/admin'){
            if(logged_user.role_id == 1 || logged_user.role_id == 2 || logged_user.role_id == 3){
                this.props.history.push('/admin/overview');
            } else {
                this.props.history.push('/admin/active-leads');
            }
        }

        if(isEmpty(logged_user) && pathname != '/admin'){
            this.props.history.push('/admin');
        }
    }

    updateLoggedUser(user){
        if(isEmpty(user)){
            localStorage.removeItem('user');

            this.props.history.push('/admin')
        }

        this.setState({
            logged_user: user
        });
    }

    render(){
        const logged_user = this.state.logged_user;
        let   content     = '';
        this.redirection();

        if(isEmpty(logged_user) && !has(logged_user,'token')){
            content = (<Login logged={(user)=> this.updateLoggedUser(user)}/>);
        } else {
            content = [
                <Header key="header" logged_user={logged_user} logout={(logged_user)=> this.updateLoggedUser(logged_user)}/>,
                (
                    <section key="content" id="gtco-main">
                        <Switch>                        
                            <Route
                                path='/admin/leads-in'
                                render={() => <LeadsRoute logged_user={logged_user}/>}
                            />
                            <Route
                                path='/admin/active-leads'
                                render={() => <LeadsActive logged_user={logged_user}/>}
                            />
                            <Route
                                path='/admin/customers'
                                render={() => <CustomersAll logged_user={logged_user}/>}
                            />
                            <Route
                                path='/admin/resellers'
                                render={() => <ResellersAll logged_user={logged_user}/>}
                            />
                            <Route
                                path='/admin/users'
                                render={() => <Users logged_user={logged_user}/>}
                            />
                            <Route
                                path='/admin/activity'
                                render={() => <Activity logged_user={logged_user}/>}
                            />
                            <Route
                                path='/admin/overview'
                                render={() => <Overview logged_user={logged_user}/>}
                            /> 
                            <Route
                                path='/admin/:id/activities'
                                render={(props) => <History {...props} logged_user={logged_user}/>}
                            />
                            <Route
                                path='/admin/logs'
                                render={() => <Logs logged_user={logged_user}/>}
                            />                                                                                                    
                        </Switch>
                    </section>
                ),
                <Footer key="footer"/>
            ];
        }
        return (
            <div id="page">
                {content}
            </div>
        );
    }
}

export default Prolead;