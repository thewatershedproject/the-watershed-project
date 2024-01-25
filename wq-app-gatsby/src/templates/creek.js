import React from "react"
import { graphql, navigate } from "gatsby"
import Layout from "../components/layout"
import defaultImage from "../images/mountains.png"
import {
  Grid,
  GridColumn,
  Image,
  Container,
  Divider,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Icon,
  Dropdown,
  GridRow,
} from "semantic-ui-react"
import Mapbox from "../components/creekMap"
import creekStyles from "../styles/creek.module.css"
import SEO from "../components/seo"
import watershedPolygons from "../data/watershedPolygons.js"

export default ({ data, pageContext }) => {
  const watershedPolygon = watershedPolygons.features.filter(
    feature => feature.properties.ws_name === pageContext.creekName
  )[0]

  const creekData = data.allCreekSiteJson.edges.filter(
    edge => edge.node.creek_id === pageContext.creekID
  )[0].node
  const creekOptions = data.allCreekSiteJson.edges.map(edge => ({
    key: edge.node.creek_id,
    text: edge.node.creek_name,
    value: edge.node.creek_id,
  }))

  const creekImage =
    data.allImagesCsv.edges.filter(edge => edge.node.ID === pageContext.creekID)
      .length === 0
      ? defaultImage
      : data.allImagesCsv.edges.filter(
          edge => edge.node.ID === pageContext.creekID
        )[0].node

  const pts = [].concat(...creekData.sites)

  const colorLookUp = {
    Good: "green",
    Marginal: "yellow",
    Bad: "red",
    NA: "grey",
  }
  const analyteScores = data.allCreekScoresCsv.edges.map(edge => [
    edge.node.AnalyteName,
    edge.node.score,
  ])

  const siteOptions = creekData.sites.map(site => ({
    key: site.site_id,
    text: site.name,
    value: site.site_id,
  }))

  const wqFeatureDescriptions = [].concat(
    ...data.allWqCategoriesFeaturesJson.edges.map(edge => edge.node.features)
  )

  return (
    <Layout>
      <Container>
        <SEO title={pageContext.creekName} />
        <Grid>
          <GridColumn width={16}>
            <h1 className={creekStyles.creekHeader}>{creekData.creek_name}</h1>
          </GridColumn>
          <GridColumn width={6}>
            {creekImage === defaultImage ? (
              <Image src={defaultImage} size="large"></Image>
            ) : (
              <a
                href={creekImage.imageURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={creekImage.imageURL}
                  alt={creekImage.altText}
                  size="large"
                ></Image>
              </a>
            )}

            <Divider hidden />
            <h1 className={creekStyles.creekHeader}>Creek Description</h1>
            <p className={creekStyles.creekDescription}>
              {creekData.creek_description}
            </p>
          </GridColumn>
          <GridColumn width={10}>
            <Grid>
              <GridRow>
                <GridColumn width={16}>
                  <Mapbox
                    watershedPolygon={watershedPolygon}
                    pts={pts}
                    // height={400}
                    zoom={10}
                    lat={creekData.creek_lat}
                    long={creekData.creek_long}
                  />
                </GridColumn>
              </GridRow>
              <GridRow>
                <GridColumn width={9}>
                  <h3 className={creekStyles.header2}>Creek Report Card</h3>
                  <Grid>
                    <GridColumn width={16}>
                      <Table basic="very" celled collapsing>
                        <TableBody className={creekStyles.creekScore}>
                          {analyteScores.map((analyte, key) => (
                            <TableRow key={key}>
                              <TableCell>{analyte[0]}</TableCell>
                              {analyte[1] === "Bad" ||
                              analyte[1] === "Marginal" ? (
                                <TableCell
                                  className={creekStyles.bad}
                                  title={
                                    wqFeatureDescriptions.filter(
                                      feature => feature.name === analyte[0]
                                    )[0].feature_description
                                  }
                                >
                                  <Icon
                                    name="circle"
                                    color={colorLookUp[analyte[1]]}
                                  ></Icon>
                                  {analyte[1]}
                                </TableCell>
                              ) : (
                                <TableCell>
                                  <Icon
                                    name="circle"
                                    color={colorLookUp[analyte[1]]}
                                  ></Icon>
                                  {analyte[1]}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </GridColumn>
                  </Grid>
                </GridColumn>
                <GridColumn width={7}>
                  <h3 className={creekStyles.header2}>
                    Explore Sampling Sites
                  </h3>
                  <Dropdown
                    placeholder="Select Site"
                    fluid
                    selection
                    options={siteOptions}
                    onChange={(e, data) => navigate(`/site/${data.value}`)}
                  />

                  <h3 className={creekStyles.header2}>Explore Other Creeks</h3>
                  <Dropdown
                    placeholder="Select Creek"
                    fluid
                    selection
                    options={creekOptions}
                    onChange={(e, data) => navigate(`/creek/${data.value}`)}
                    defaultValue={pageContext.creekID}
                  />
                </GridColumn>
              </GridRow>
            </Grid>
          </GridColumn>
        </Grid>
      </Container>
    </Layout>
  )
}

export const query = graphql`
  query($creekID: String!) {
    allCreekSiteJson {
      edges {
        node {
          creek_name
          creek_description
          creek_id
          creek_lat
          creek_long
          sites {
            site_id
            name
            description
            lat
            long
          }
        }
      }
    }
    allCreekScoresCsv(filter: { creek_id: { eq: $creekID } }) {
      edges {
        node {
          creek_id
          AnalyteName
          score
        }
      }
    }
    allWqCategoriesFeaturesJson {
      edges {
        node {
          features {
            name
            feature_description
          }
        }
      }
    }
    allImagesCsv {
      edges {
        node {
          imageURL
          ID
          altText
        }
      }
    }
  }
`
