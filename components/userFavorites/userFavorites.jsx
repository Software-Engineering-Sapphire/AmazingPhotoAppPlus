import React from 'react';
import axios from "axios";
import {Modal, Typography} from "@mui/material";
import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import './userFavorites.css';

class UserFavorites extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: null,
            modalShow: false,
            modalPhoto: null
        };
    }

    fetchDataFromAPI() {
        axios.get('/favorites')
            .then(returnedObject => {
                this.setState({photos: returnedObject.data});
            })
            .catch((err) => {
                console.error(err);
            });
    }

    componentDidMount() {
        this.fetchDataFromAPI();
    }

    handleDelete(photoId){
        axios.delete("/favorite/" + photoId)
            .then(() => {
                const updatedArray = this.state.photos.filter(photo => photo._id !== photoId);
                this.setState({photos: updatedArray});
            })
            .catch((err) => {
                console.error(err);
            });
    }

    handleThumbnailClick (photo) {
        this.setState({modalShow: true, modalPhoto: photo});
    }

    render() {
        const {photos} = this.state;
        if (photos === null) {
            return <Typography>Loading...</Typography>;
        } else if (photos.length === 0) {
            return <div>You Don&apos;t Have Any Photo Favorites Yet</div>;
        } else {
            return (
                <div className="flex-row">
                {
                    photos.map(
                        (photo, index) => {
                            return (
                                <div className={"flex-item"} key={index}>
                                    <img className="thumbnail"
                                         src={"../../images/" + photo.file_name}
                                         onClick={() => this.handleThumbnailClick(photo)}/>
                                    <RemoveCircleOutlineSharpIcon onClick={() => this.handleDelete(photo._id)}/>
                                </div>
                            );
                        }
                    )
                }
                    <Modal className="modal" open={this.state.modalShow} onClose={() => this.setState({modalShow: false})}>
                        {
                            this.state.modalShow ?
                                (
                                    <div className="modalElement">
                                        <img src={"../../images/" + this.state.modalPhoto.file_name}/>

                                        <Typography>
                                            {"Uploaded on : " + this.state.modalPhoto.date_time}
                                        </Typography>
                                    </div>
                                )
                                : <div></div>
                        }
                    </Modal>
                </div>
            );
        }
    }
}

export default UserFavorites;