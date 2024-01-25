import React, { useState, Fragment } from "react"
import { graphql, navigate, withPrefix } from "gatsby"
import Layout from "../components/layout"
import {
  Grid,
  GridColumn,
  Dropdown,
  Container,
  Accordion,
} from "semantic-ui-react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import moment from "moment"
import cedenStyles from "../styles/ceden.module.css"
import SEO from "../components/seo"

export default ({ data, pageContext }) => {
  const analytes = data.allExternalCedenJson.edges.map(edge => [
    edge.node.Analyte,
    edge.node.Unit,
  ])

  const siteData = data.allExternalCedenJson.edges[0].node

  const otherSites = data.allTwpCedenSitesCsv.edges.filter(
    edge => edge.node.source === "CEDEN"
  )

  const siteOptions = otherSites.map(site => ({
    key: site.node.site_id,
    text: site.node.name,
    value: site.node.site_id,
  }))

  const [analyteUnit, setAnalyteUnit] = useState("")

  const analyteOptions = analytes.map((analyte, key) => ({
    key: key,
    text: `${analyte[0]} (${analyte[1]})`,
    value: `${analyte[0]} (${analyte[1]})`,
  }))

  const handleAnalyteChange = e => {
    e.preventDefault()
    return setAnalyteUnit(e.target.textContent)
  }

  const selectedAnalyteUnit = analyteUnit.split(/[()]/)
  const unit = selectedAnalyteUnit[1]
  const analyte = selectedAnalyteUnit[0].slice(0, -1)

  const plotData = data.allExternalCedenJson.edges.filter(
    edge => (edge.node.Analyte === analyte) & (edge.node.Unit === unit)
  )

  const wqFeature =
    plotData.length > 0 ? plotData[0].node.analyte_desc_name : null

  const featureDescription =
    analyteUnit !== ""
      ? []
          .concat(
            ...data.allWqCategoriesFeaturesJson.edges.map(
              edge => edge.node.features
            )
          )
          .filter(feature => feature.name === wqFeature)[0].feature_description
      : null

  const wqFeatureDescrContent =
    analyteUnit === "" ? (
      <p className={cedenStyles.text}>Select a Water Quality Feature</p>
    ) : (
      <Fragment>
        <h3 className={cedenStyles.header}>{wqFeature}</h3>
        <p className={cedenStyles.text}>{featureDescription}</p>
      </Fragment>
    )

  const protocolInfoContent =
    analyteUnit === "" ? (
      <p className={cedenStyles.text}>Select a Water Quality Feature</p>
    ) : (
      <p
        className={cedenStyles.text}
      >{`${plotData[0].node.ProtocolName} (${plotData[0].node.ProtocolCode}) - ${plotData[0].node.ProtocolDescr}`}</p>
    )

  const moreInfoPanels = [
    {
      key: "wq-feature-descr",
      title: "Water Quality Feature Description",
      content: { content: wqFeatureDescrContent },
    },
    {
      key: "protocol-info",
      title: "Protocol Information",
      content: { content: protocolInfoContent },
    },
  ]

  const plotOptions = {
    chart: {
      type: "column",
      zoomType: "xy",
    },
    title: {
      text: "",
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Date",
      },
    },
    yAxis: {
      title: {
        text: analyteUnit,
      },
      min: 0,
    },
    series: [
      {
        name: analyteUnit,
        data:
          plotData.length > 0
            ? plotData[0].node.data.map(pt => [
                moment.utc(pt.SampleDate).valueOf(),
                pt.Result,
              ])
            : null,
      },
    ],
    credits: {
      enabled: false,
    },
  }

  return (
    <Layout>
      <Container>
        <SEO title={pageContext.stationName} />
        <Grid>
          <GridColumn width={12}>
            <h1 className={cedenStyles.header}>
              Station Name: {pageContext.stationName}
            </h1>
            <div>
              <h3 className={cedenStyles.header}>
                Select Water Quality Feature
              </h3>
              <Dropdown
                placeholder="Water Quality Feature"
                search
                selection
                options={analyteOptions}
                onChange={handleAnalyteChange}
                defaultValue={analyte}
              />
            </div>
            {analyteUnit === "" ? null : (
              <Fragment>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={plotOptions}
                />
                <p className={cedenStyles.text}>
                  Click and drag on the chart to zoom in
                </p>
              </Fragment>
            )}
          </GridColumn>
          <GridColumn width={4}>
            <h2 className={cedenStyles.header}>More Information</h2>
            <p className={cedenStyles.text}>
              <b>Program:</b> {siteData.Program}
            </p>
            <p className={cedenStyles.text}>
              <a
                href="https://ceden.waterboards.ca.gov/AdvancedQueryTool"
                target="_blank"
                rel="noopener noreferrer"
              >
                CEDEN Data
              </a>
            </p>
            <Accordion panels={moreInfoPanels} />
            <h3 className={cedenStyles.header}>Explore Other CEDEN Sites</h3>
            <Dropdown
              placeholder="Select Site"
              fluid
              selection
              defaultValue={siteData.StationCode}
              options={siteOptions}
              onChange={(e, data) => navigate(`/ceden-site/${data.value}`)}
            />
          </GridColumn>
        </Grid>
      </Container>
    </Layout>
  )
}

export const query = graphql`
  query($stationCode: String!) {
    allExternalCedenJson(filter: { StationCode: { eq: $stationCode } }) {
      edges {
        node {
          Program
          StationName
          StationCode
          ProtocolCode
          ProtocolDescr
          ProtocolName
          analyte_desc_name
          Analyte
          Unit
          data {
            Result
            SampleDate(formatString: "")
          }
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
    allTwpCedenSitesCsv {
      edges {
        node {
          name
          site_id
          source
        }
      }
    }
  }
`
