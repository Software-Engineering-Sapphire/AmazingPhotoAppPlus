import React from 'react';
import {Button, Typography} from '@mui/material';
import './userDetail.css';
import axios from 'axios';

class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    componentDidMount() {
        this.fetchDataFromAPI();
    }

    fetchDataFromAPI() {
        axios.get('/user/' + this.props.match.params.userId)
            .then(returnedObject => {
                this.setState({user: returnedObject.data});
            })
            .catch((err) => {
                console.error(err);
            });
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.userId !== prevProps.match.params.userId) {
            this.fetchDataFromAPI();
        }
    }
    render() {
        if (this.state.user === null) {
            return <Typography>Loading...</Typography>;
        } else {
            return (
                <div>
                    <div key="userPhotosBtn">
                        <Button variant="contained" href={`#/photos/${this.props.match.params.userId}`}>
                            User Photos
                        </Button>
                    </div>
                    <div className="borderBox">
                        <Typography variant="body1">
                            User ID: {this.state.user._id}
                        </Typography>
                        <Typography variant="body1">
                            User Name: {this.state.user.first_name + ' ' + this.state.user.last_name}
                        </Typography>
                        <Typography variant="body1">
                            Location: {this.state.user.location}
                        </Typography>
                        <Typography variant="body1">
                            Description: {this.state.user.description}
                        </Typography>
                        <Typography variant="body1">
                            Occupation: {this.state.user.occupation}
                        </Typography>
                    </div>
                </div>

            );
        }
    }
}

export default UserDetail;