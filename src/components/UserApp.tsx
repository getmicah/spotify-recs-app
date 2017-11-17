import * as React from "react"

import * as api from "../utils/api"
import { SpotifyItem } from "../models/SpotifyModel"
import artistStore from "../stores/ArtistStore"
import trackStore from "../stores/TrackStore"
import seedStore from "../stores/SeedStore"
import * as artistActions from "../actions/ArtistActions"
import * as trackActions from "../actions/TrackActions"

import Logout from "./Logout"
import SpotifySeeds from "./SpotifySeeds"
import TuningSeeds from "./TuningSeeds"
import MainButton from "./MainButton"

interface props {}
interface state {
	artists: SpotifyItem[]
	tracks: SpotifyItem[]
	danceability: number
	energy: number
	popularity: number
	valence: number
	searchType: "artist" | "track",
	playlistJSON: any,
	buttonText: string,
	buttonHandler: any,
	buttonDisabled: boolean
}

export default class UserApp extends React.Component<props, state> {
	constructor(props) {
		super(props)
		this.state = {
			artists: artistStore.get(),
			tracks: trackStore.get(),
			danceability: seedStore.getDanceability(),
			energy: seedStore.getEnergy(),
			popularity: seedStore.getPopularity(),
			valence: seedStore.getValence(),
			searchType: "artist",
			playlistJSON: null,
			buttonText: "Get Recomendations",
			buttonHandler: this.handleLoadClick.bind(this),
			buttonDisabled: false
		}
	}

	updateArtists() {
		this.setState({artists: artistStore.get()})
	}

	updateTracks() {
		this.setState({tracks: trackStore.get()})
	}

	updateSeeds() {
		this.setState({
			danceability: seedStore.getDanceability(),
			energy: seedStore.getEnergy(),
			popularity: seedStore.getPopularity(),
			valence: seedStore.getValence()
		})
	}

	toggleSearchType() {
		this.setState({searchType: this.state.searchType === "artist" ? "track" : "artist"})
	}

	loadRecs() {
		api.getRec(this.state.artists, this.state.tracks, this.state.danceability, this.state.energy, this.state.popularity, this.state.valence)
			.then((json) => {
				this.setState({
					playlistJSON: json,
					buttonText: "Add Playlist to Spotify",
					buttonHandler: this.addPlaylist.bind(this)
				})
			})
			.catch((err) => {
				console.log(err)
			})
	}

	addPlaylist() {
		api.postPlaylist(this.state.playlistJSON)
			.then((json) => {
				this.setState({
					buttonText: "Done!",
					buttonHandler: null,
					buttonDisabled: true
				})
			})
			.catch((err) => {
				console.log(err)
			})
	}

	handleLoadClick() {
		if (this.state.artists.length > 0 || this.state.tracks.length > 0) {
			this.setState({buttonText: "Loading..."})
			this.loadRecs()
		} else {
			alert("Please select at least one artist or track")
		}
	}

	componentWillMount() {
		artistStore.on("change", this.updateArtists.bind(this))
		trackStore.on("change", this.updateTracks.bind(this))
		seedStore.on("change", this.updateSeeds.bind(this))
	}

	render() {
		return (
			<div>
				<Logout />
				<div id="user-app">
					<SpotifySeeds
						type={this.state.searchType}
						max={3}
						store={this.state.searchType === "artist" ? artistStore : trackStore}
						actions={this.state.searchType === "artist" ? artistActions : trackActions}
						toggle={this.toggleSearchType.bind(this)}
						artists={this.state.artists}
						tracks={this.state.tracks}
					/>
					<TuningSeeds
						danceability={this.state.danceability}
						energy={this.state.energy}
						popularity={this.state.popularity}
						valence={this.state.valence}
					/>
					<MainButton
						text={this.state.buttonText}
						handler={this.state.buttonHandler}
						disabled={this.state.buttonDisabled}
					/>
				</div>
			</div>
		)
	}
}