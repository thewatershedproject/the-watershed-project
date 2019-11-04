import React, { Component } from "react"
import ReactMapGL, { Marker, Popup } from "react-map-gl"
import mapStyles from "../styles/map.module.css"
import pin from "../images/marker-stroked-15.svg"

const TOKEN = process.env.MapboxAccessToken

class Mapbox extends Component {
  constructor(props) {
    super(props)

    this.state = {
      viewport: {
        width: "100%",
        height: 600,
        latitude: 37.929787,
        longitude: -122.076019,
        zoom: 10,
      },
      selectedSite: null,
    }
  }

  setSelectedSite = site => {
    this.setState({
      selectedSite: site,
      viewport: {
        ...this.state.viewport,
        latitude: site.lat,
        longitude: site.long,
        zoom: 13
      }
    })
  }

  closePopup = () => {
    this.setState({
      selectedSite: null,
    })
  }

  // mapStyle="mapbox://styles/mapbox/outdoors-v10?optimize=true"
  render() {
    return (
      <ReactMapGL
        mapboxApiAccessToken={TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v9?optimize=true"
        {...this.state.viewport}
        onViewportChange={viewport => this.setState({ viewport })}
      >
        {this.props.pts.map((pt, key) => (
          <Marker latitude={pt.lat} longitude={pt.long} key={key}>
            <img
              className={mapStyles.locationIcon}
              src={pin}
              onClick={() => this.setSelectedSite(pt)}
            ></img>
          </Marker>
        ))}
        {this.state.selectedSite !== null ? (
          <Popup
            latitude={this.state.selectedSite.lat}
            longitude={this.state.selectedSite.long}
            onClose={this.closePopup}
            closeOnClick={false}
          >
            <div>
              <a href={`/site/${this.state.selectedSite.site_id}`}>{this.state.selectedSite.name}</a>
            </div>
          </Popup>
        ) : null}
      </ReactMapGL>
    )
  }
}

export default Mapbox