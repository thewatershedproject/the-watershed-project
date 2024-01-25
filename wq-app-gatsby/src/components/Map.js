import React from "react"
import mapboxgl from "mapbox-gl"
import mapStyles from "../styles/map.module.css"
import watershedPolygons from "../data/watershedPolygons.js"
import pinTWP from "../images/marker-stroked-15.svg"
import pinCEDEN from "../images/marker-stroked-15-ceden.svg"
import { navigate } from "gatsby"

const TOKEN = process.env.GATSBY_MapboxAccessToken

mapboxgl.accessToken = TOKEN

class MapBox extends React.Component {
  map

  constructor(props) {
    super(props)
    this.state = {
      lng: this.props.long,
      lat: this.props.lat,
      zoom: this.props.zoom,
      watershed: null,
    }
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/light-v9?optimize=true",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    })

    this.map.on("load", () => {
      this.map.addSource("watersheds", {
        type: "geojson",
        data: watershedPolygons,
      })

      this.map.addLayer(
        {
          id: "watersheds-layer",
          type: "fill",
          source: "watersheds",
          paint: {
            "fill-color": {
              property: "twp_monito",
              stops: [
                [0, "#fff"],
                [1, "#999"],
              ],
            },
            "fill-opacity": 0.2,
            "fill-outline-color": "#000",
          },
        },
        "country-label-lg"
      ) // ID metches `mapbox/streets-v9`

      this.map.on("mousemove", "watersheds-layer", e => {
        this.setState({ watershed: e.features[0].properties.ws_name })

        if (e.features[0].properties.twp_monito === 1) {
          this.map.getCanvas().style.cursor = "pointer"
        } else {
          this.map.getCanvas().style.cursor = ""
        }
      })

      this.map.on("mouseleave", "watersheds-layer", e => {
        this.setState({ watershed: null })
      })

      this.map.on("click", "watersheds-layer", e => {
        if (e.features[0].properties.twp_monito === 1) {
          navigate(`/creek/${e.features[0].properties.creek_id}`)
        }
      })

      this.props.pts.map(pt => {
        var popup = new mapboxgl.Popup({ offset: 20 }).setHTML(
          pt.source === "The Watershed Project"
            ? `<a href="/site/${pt.site_id}">${pt.name}</a>`
            : `<a href="/ceden-site/${pt.site_id}">${pt.name}</a>`
        )
        var el = document.createElement("div")
        el.className =
          pt.source === "The Watershed Project"
            ? mapStyles.marker1
            : mapStyles.marker2

        return new mapboxgl.Marker(el)
          .setLngLat([pt.long, pt.lat])
          .setPopup(popup)
          .addTo(this.map)
      })
    })

    this.map.addControl(new mapboxgl.NavigationControl(), "top-left")
  }

  render() {
    return (
      <div style={{ position: "relative" }}>
        <div
          ref={el => (this.mapContainer = el)}
          className={mapStyles.mapContainer}
        />
        <div className={mapStyles.legend}>
          <div>
            <span>
              <img
                style={{ display: "inline-block" }}
                src={pinTWP}
                alt=""
              ></img>
            </span>
            <span>
              <p style={{ display: "inline-block", paddingLeft: "4px" }}>
                TWP Site
              </p>
            </span>
          </div>
          <div>
            <span>
              <img
                style={{ display: "inline-block" }}
                src={pinCEDEN}
                alt=""
              ></img>
            </span>
            <span>
              <p style={{ display: "inline-block", paddingLeft: "4px" }}>
                CEDEN Site
              </p>
            </span>
          </div>
          <div>
            <span>
              <p style={{ display: "inline-block", paddingTop: "10px" }}>
                <b>{this.state.watershed}</b>
              </p>
            </span>
          </div>
        </div>
      </div>
    )
  }
}

export default MapBox
