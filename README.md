<!DOCTYPE html>
<meta charset="utf-8">

<head>

    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="./d3-v4.js"></script>
    <script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
    <script src="https://d3js.org/d3-geo-projection.v2.min.js"></script>

    <style>
        body {
            background-color: #F2F3F6;
            min-height: 100%;
            font-family: "Verdana", sans-serif;
        }

        h1 {
            margin: 0;
            font-size: 20px;
            text-align: center;
        }

        #legend {
            font-size: 0.7em;
            letter-spacing: 0.1em;
        }

        .map {
            padding: 20px;
            background-color: #FFFFFF;
            border: 1px solid #4D8DC4;
            box-shadow: 1px 1px 15px #000000;
            position: absolute;
            left: 30%;
            top: 40%;
            transform: translate(-55%, -32%);
        }

        div.tooltip {
            position: absolute;
            padding: 7px;
            font-size: 0.8em;
            pointer-events: none;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 3px 3px 10px 0px rgba(0, 0, 0, 0.25);
        }

        .background {
            fill: transparent;
        }

        .world {
            transform-origin: center;
        }

        a {
            text-decoration: none;
            color: #000000;
        }

        a.underlined {
            text-decoration: underline;
        }


        #barChart {
            padding: 20px;
            background-color: floralwhite;
            border: 1px solid #4D8DC4;
            box-shadow: 0px 0px 10px #000000;
            /* position: absolute;
            right: 0;
            top: 0;
            transform: translate(-5%, 33%); */

        }

        .dataTable {
            margin-top: 1.2rem;
            padding: 20px;
            background-color: floralwhite;
            border: 1px solid #4D8DC4;
            box-shadow: 1px 1px 15px #000000;
            /* position: absolute;
            right: 0;
            bottom: 0;
            transform: translate(-5%, -5%); */

        }

        .header {
            padding: 40px;
            text-align: center;
            background-image: url("https://i.pinimg.com/originals/5e/da/42/5eda42d9fb0c228bc191e073b535e0a6.jpg");
            background-size: cover;
            color: white;
            font-size: 30px;
        }

        .container-flex {
            display: flex;
            justify-content: space-evenly;
            width: 100%;
        }

        .container-col-left {
            width: 58%;
            padding: 10px;

        }
        .container-col-right {
            width: 40%;
            padding: 10px;

        }
    </style>

</head>

<body>
    <div class="header" style="height: 0px;">
        <h1>Walkthrough of Fifa Over Time</h1>
    </div>
    <div class="container-flex">
        <div class="container-col-left">
            <h1>FIFA..A Story</h1>

            <div>
                <select id="year">Year</select>
            </div>


            <svg id="choropleth" width="900" height="660"></svg>
        </div>
        <div class="container-col-right">
            <div id="barChart"></div>

            <div class="dataTable" id="dataTable"></div>
        </div>
    </div>

    <script src="fifa_function.js"></script>

</body>
