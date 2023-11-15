import React from 'react';
import {
    AppBar, Toolbar, Typography, Checkbox, FormControlLabel, Button
} from '@mui/material';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            version: undefined,
            uploadInput: undefined,
        };
    }

    fetchDataFromAPI() {
        axios.get('/test/info')
            .then(returnedObject => {
                this.setState({version: returnedObject.data.__v});
            })
            .catch((err) => {
                console.error(err);
            });
    }

    componentDidMount() {
        this.fetchDataFromAPI();
    }

    componentDidUpdate(prevProps) {
        if (this.props.topBarStatus !== prevProps.topBarStatus) {
            this.fetchDataFromAPI();
        }
    }

    handleCheckboxChange = (event) => {
        this.props.toggleAdvancedFeatures(event.target.checked);
    };

    handleFileChange = (event) => {
        const file = event.target.files[0];
        this.setState({ uploadInput: file });
    };

    handleUploadButtonClicked = (e) => {
        document.getElementById('fileUploader').value = '';
        e.preventDefault();
        if (this.state.uploadInput) {
            // Create a DOM form and add the file to it under the name uploadedphoto
            const domForm = new FormData();
            domForm.append('uploadedphoto', this.state.uploadInput);
            axios.post('/photos/new', domForm)
                .then((res) => {
                    console.log(res);
                })
                .catch(err => console.log(`POST ERR: ${err}`));
        }
    };
    render() {
        return (
            <AppBar className="topbar-appBar" position="absolute">
                <Toolbar className="topbar-toolbar">
                    <Typography variant="h5" color="inherit">
                        {this.props.topBarStatus}
                        {this.props.userIsLoggedIn &&
                            (
                                <Button variant="outlined" color="inherit" sx={{margin: "10px"}}
                                    onClick = {() => {
                                        this.props.logoutUser();
                                    }}
                                    >Logout
                                </Button>
                            )}
                    </Typography>

                    <Typography variant="h5" color='inherit'>
                        {this.props.userIsLoggedIn && (
                            <input
                                id={'fileUploader'}
                                type="file"
                                accept="image/*"
                                onChange={this.handleFileChange}
                            />
                        )}
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        {this.props.userIsLoggedIn && (
                            <Button variant="contained" onClick={this.handleUploadButtonClicked}>Upload Photo
                            </Button>
                        )}
                    </Typography>

                    <FormControlLabel control={(
                        <Checkbox checked={this.props.advancedFeatures}
                                  onChange={this.handleCheckboxChange}
                                  style={{color: '#FFF'}}
                        />
                    )} label="Advanced Features"/>
                    <Typography variant="h5" color="inherit">
                        Team Sapphire Version: {this.state.version}
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }
}

export default TopBar;
