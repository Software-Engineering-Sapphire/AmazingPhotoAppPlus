import React from 'react';
import './ActivityLog.css';
import axios from 'axios';
import {List, ListItem, Typography} from "@mui/material";

class ActivityLog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            actions: null
        };
    }

    fetchDataFromAPI() {
        axios.get('/activity')
            .then(returnedObject => {
                this.setState({actions: returnedObject.data});
            })
            .catch(err => {
                console.error(err);
            });
    }

    componentDidMount() {
        this.fetchDataFromAPI();
    }

    componentDidUpdate(prevState) {
        if (this.state !== prevState) {
            this.fetchDataFromAPI();
        }
    }

    render() {
        const {actions} = this.state;
        if (actions === null || actions.length === 0) {
            return <Typography>Nothing has happened recently...</Typography>;
        } else {
            return (
<List>
                {actions.map((event, index) => (
                    <ListItem key={index}>
                        {event.type === "login" && (
                            <Typography>
                                {Date(event.date_time)
                                    .slice(0, 21)} - A user logged in!
                            </Typography>
                          )}
                        {event.type === "logout" && (
                            <Typography>
                                {Date(event.date_time)
                                    .slice(0, 21)} - A user logged out!
                            </Typography>
                          )}
                        {event.type === "register" && (
                            <Typography>
                                {Date(event.date_time)
                                    .slice(0, 21)} - A new user registered!
                            </Typography>
                          )}
                        {event.type === "comment" && (
                            <>
                                <img src={"../../images/" + event.photo_filename}
                                     className="comment-image" alt="comment preview"/>
                                <Typography>
                                    {Date(event.date_time)
                                        .slice(0, 21)} - {event.user} posted a new comment!
                                </Typography>
                            </>
                          )}
                        {event.type === "photo" && (
                            <>
                                <img src={"../../images/" + event.photo_filename}
                                     className="photo-image" alt="post preview"/>
                                <Typography>
                                    {Date(event.date_time)
                                        .slice(0, 21)} - {event.user === null ? "Someone" : event.user} posted a new
                                    photo!
                                </Typography>
                            </>
                          )}
                    </ListItem>
                ))}
                {actions.length < 5 && (
                    <ListItem>
                        <Typography>
                            Nothing else has happened recently...
                        </Typography>
                    </ListItem>
                  )}
</List>
);
        }
    }
}

export default ActivityLog;