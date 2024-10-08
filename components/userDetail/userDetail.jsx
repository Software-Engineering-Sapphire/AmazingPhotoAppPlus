import React from 'react';
import {Button, Typography} from '@mui/material';
import './userDetail.css';
import axios from 'axios';

class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            photos: null
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
        axios.get('/photosOfUser/' + this.props.match.params.userId)
            .then(returnedObject => {
                this.setState({photos: returnedObject.data});
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
        const {photos} = this.state;
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
                        <Typography variant="body1">
                            Most Recently Uploaded Photo:
                        </Typography>
                        <div className="flex-row">
                            {
                                (photos !== null) ?
                                    (() => {
                                        const sortedPhotos = photos
                                            .filter(photo => photo.date_time) // Ensure each photo has a date_time property
                                            .sort((a, b) => new Date(b.date_time) - new Date(a.date_time)); // Sort in descending order of date_time

                                        if (sortedPhotos.length > 0) {
                                            const mostRecentPhoto = sortedPhotos[0];
                                            const photoUrl = `../../images/${mostRecentPhoto.file_name}`;
                                            const userPhotosUrl = `#/photos/${this.props.match.params.userId}`;

                                            return (
                                                <div className={"flex-item"}>
                                                    <a href={userPhotosUrl}>
                                                        <img className="thumbnail" src={photoUrl} />
                                                        <p>Date Time: {mostRecentPhoto.date_time}</p>
                                                    </a>
                                                </div>
                                            );
                                        } else {
                                            return <div></div>;
                                        }
                                    })()
                                    : <div></div>
                            }
                        </div>
                        <Typography variant="body1">
                            Most Commented Photo:
                        </Typography>
                        <div className="flex-row">
                            {
                                (photos !== null) ?
                                    (() => {
                                        const sortedPhotos = photos
                                            .filter(photo => photo.comments) // Ensure each photo has a comments property
                                            .sort((a, b) => b.comments.length - a.comments.length); // Sort in descending order of comments

                                        if (sortedPhotos.length > 0) {
                                            const photoWithMostComments = sortedPhotos[0];
                                            const photoUrl = `../../images/${photoWithMostComments.file_name}`;
                                            const userPhotosUrl = `#/photos/${this.props.match.params.userId}`;

                                            return (
                                                <div className={"flex-item"}>
                                                    <a href={userPhotosUrl}>
                                                        <img className="thumbnail" src={photoUrl} />
                                                        <p>Number of Comments: {photoWithMostComments.comments.length}</p>
                                                    </a>
                                                </div>
                                            );
                                        } else {
                                            return <div></div>;
                                        }
                                    })()
                                    : <div></div>
                            }
                        </div>
                    </div>
                </div>

            );
        }
    }
}

export default UserDetail;