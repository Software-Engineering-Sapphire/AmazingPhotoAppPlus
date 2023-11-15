import React from 'react';
import {Button, Typography} from '@mui/material';
import './userPhotos.css';
import {Link} from "react-router-dom";
import axios from 'axios';

class UserPhotos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: null,
        };
    }

    componentDidMount() {
        this.fetchDataFromAPI();
    }

    fetchDataFromAPI() {
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

    // Handle comment submission
    handleCommentSubmit = (photoId, newComment) => {
        axios
            .post('/commentsOfPhoto/' + photoId, {comment: newComment})
            .then(() => {
                this.fetchDataFromAPI();
            })
            .catch((err) => {
                console.error(err);
            });
    };

    render() {
        const {photos} = this.state;
        if (photos === null) {
            return <Typography>Loading...</Typography>;
        } else {
            return (
                <div>
                    <div key="userDetailsBtn">
                        <Button variant="contained" href={`#/users/${this.props.match.params.userId}`}>
                            User Details
                        </Button>
                    </div>
                    <div>
                        {photos.map((photo, index) => {
                            return (
                                <div key={index}>
                                    <div className="borderBox">
                                        <p>{photo.date_time}</p>
                                        <img src={"../../images/" + photo.file_name}
                                             alt={`User ${this.props.match.params.userId}`}/>
                                    </div>
                                    {photo.comments.map((comment, index2) => (
                                            <div
                                                className="borderBox" key={index.toString() + index2.toString()}>
                                                <p>{comment.date_time}</p>
                                                <Link to={`/users/${comment.user._id}`}>
                                                    <p>{comment.user.first_name + " " + comment.user.last_name}</p>
                                                </Link>
                                                <p>{comment.comment}</p>
                                            </div>
                                        )
                                    )}
                                    {/* Add a form for adding comments */}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            this.handleCommentSubmit(photo._id, e.target[0].value);
                                            e.target[0].value = '';
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Add a comment"
                                            onChange={this.handleCommentChange}
                                        />
                                        <button type="submit">Add Comment</button>
                                    </form>
                                </div>

                            );
                        })}
                    </div>
                </div>
            );
        }
    }
}

export default UserPhotos;