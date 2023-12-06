import React from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';
import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';

class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            mostRecentPhoto: null,
            mostCommentedPhoto: null,
        };
    }

    componentDidMount() {
        this.fetchDataFromAPI();
    }

    fetchDataFromAPI() {
        axios.get('/user/' + this.props.match.params.userId)
            .then(returnedObject => {
                this.setState({ user: returnedObject.data });
            })
            .catch((err) => {
                console.error(err);
            });

        // Fetch the most recent photo
        axios.get('/recentPhotoOfUser/' + this.props.match.params.userId)
            .then(returnedObject => {
                const mostRecentPhoto = returnedObject.data[0]; // Assuming the endpoint returns a single photo
                this.setState({ mostRecentPhoto });
            })
            .catch((err) => {
                console.error(err);
            });

        // Fetch the most commented photo
        axios.get('/mostCommentedPhotoOfUser/' + this.props.match.params.userId)
            .then(returnedObject => {
                const mostCommentedPhoto = returnedObject.data[0]; // Assuming the endpoint returns a single photo
                this.setState({ mostCommentedPhoto });
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
        const { mostRecentPhoto, mostCommentedPhoto } = this.state;

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
                                (mostRecentPhoto !== null) ?
                                    <div className={"flex-item"}>
                                        <a href={`#/photos/${this.props.match.params.userId}`}>
                                            <img className="thumbnail" src={`../../images/${mostRecentPhoto.file_name}`} alt="Recent" />
                                            <p>Date Time: {mostRecentPhoto.date_time}</p>
                                        </a>
                                    </div>
                                    : <div></div>
                            }
                        </div>
                        <Typography variant="body1">
                            Most Commented Photo:
                        </Typography>
                        <div className="flex-row">
                            {
                                (mostCommentedPhoto !== null) ?
                                    <div className={"flex-item"}>
                                        <a href={`#/photos/${this.props.match.params.userId}`}>
                                            <img className="thumbnail" src={`../../images/${mostCommentedPhoto.file_name}`} alt="Commented" />
                                            <p>Number of Comments: {mostCommentedPhoto.comments.length}</p>
                                        </a>
                                    </div>
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
