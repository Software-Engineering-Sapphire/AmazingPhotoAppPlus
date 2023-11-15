import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter, Route, Switch
} from 'react-router-dom';
import {
    Grid, Paper,
} from '@mui/material';
import './styles/main.css';

import {Redirect} from "react-router";

import axios from "axios";
// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import UserComments from './components/userComments/userComments';
import LoginRegister from "./components/loginRegister/LoginRegister";

class PhotoShare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topBarStatus: "Please Login",
            advancedFeatures: false,
            userIsLoggedIn: false
        };
        this.toggleAdvancedFeatures = this.toggleAdvancedFeatures.bind(this);
        this.updateLoggedInUser = this.updateLoggedInUser.bind(this);
    }

    toggleAdvancedFeatures = (advancedFeaturesBool) => {
        this.setState({advancedFeatures: advancedFeaturesBool});
    };

    updateLoggedInUser = (user = null) => {
        if (user == null) {
            axios.post("/admin/logout").then(
                () => {
                    this.setState({userIsLoggedIn: false});
                    this.setState({topBarStatus: "Please Login"});
            }).catch(
                (err) => {
                    console.log(err);
                }
            );
        } else {
            this.setState({userIsLoggedIn: true});
            this.setState({topBarStatus: "Hi, " + user.first_name});
        }
    };

    render() {
        const userIsLoggedIn = this.state.userIsLoggedIn;
        return (
            <HashRouter>
                <div>
                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <TopBar topBarStatus={this.state.topBarStatus}
                                    advancedFeatures={this.state.advancedFeatures}
                                    toggleAdvancedFeatures={this.toggleAdvancedFeatures}
                                    userIsLoggedIn={this.state.userIsLoggedIn}
                                    logoutUser={this.updateLoggedInUser}
                            />
                        </Grid>
                        <div className="main-topbar-buffer"/>
                        <Grid item sm={3}>
                            <Paper className="main-grid-item">
                                {userIsLoggedIn && <UserList advancedFeatures={this.state.advancedFeatures}/>}
                            </Paper>
                        </Grid>
                        <Grid item sm={9}>
                            <Paper className="main-grid-item">
                                <Switch>
                                    (<Route path="/login-register"
                                               render={props => (
                                                   <LoginRegister {...props}
                                                    updateLoggedInUser={this.updateLoggedInUser}/>
                                               )}/>
                                    )

                                    <Route exact path="/"
                                        render={() => (
                                            userIsLoggedIn ?
                                                <div></div>
                                                :
                                                <Redirect to={"/login-register"}/>
                                        )}/>

                                    {/*userId is a placeholder for a user ID. userId is passed as props to the UserDetail component. */}
                                    <Route path="/users/:userId"
                                           render={props => (
                                               userIsLoggedIn ?
                                               <UserDetail {...props}/> :
                                               <Redirect to={"/login-register"}/>
                                           )}
                                    />
                                    <Route path="/photos/:userId"
                                           render={props => (userIsLoggedIn ?
                                                   (
                                                       <UserPhotos {...props}
                                                           advancedFeatures={this.state.advancedFeatures}/>
                                                   ) :
                                                   <Redirect to={"/login-register"}/>
                                           )}/>
                                    <Route path="/comments/:userId"
                                           render={props => (userIsLoggedIn ?
                                                   (
                                                       <UserComments {...props}
                                                             advancedFeatures={this.state.advancedFeatures}/>
                                                   ) :
                                                   <Redirect to={"/login-register"}/>
                                           )}
                                    />
                                    <Route path="/users" component={UserList}/>

                                    <Redirect from='*' to='/' />
                                </Switch>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </HashRouter>
        );
    }
}


ReactDOM.render(
    <PhotoShare/>,
    document.getElementById('photoshareapp'),
);
