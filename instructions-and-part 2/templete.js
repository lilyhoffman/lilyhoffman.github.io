// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let margin = { top: 50, right: 150, bottom: 50, left: 50 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    let svg = d3.select('#scatterplot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Set up scales for x and y axes
    let xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([0, width]);

    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    // Create a color scale for species
    const colorScale = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Species))])
        .range(d3.schemeCategory10);

    // Add circles for each data point
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.PetalLength))
        .attr('cy', d => yScale(d.PetalWidth))
        .attr('r', 5)
        .attr('fill', d => colorScale(d.Species));

    // Add x-axis to the canvas
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis to the canvas
    svg.append('g')
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append('text')
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Petal Length");

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Petal Width");

    // Add legend for species colors
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // Add colored circles for each legend entry
    legend.append("circle")
        .attr("cx", width + 20)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", d => colorScale(d));

    // Add text labels for each legend entry
    legend.append("text")
        .attr("x", width + 35)
        .attr("y", 5)
        .attr("dy", "0.32em")
        .text(d => d);
});


// Load Iris data 
iris.then(function(data) {
    // Convert string values to numbers for relevant fields
    data.forEach(d => {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
        d.SepalLength = +d.SepalLength;
        d.SepalWidth = +d.SepalWidth;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = 800 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([0, width])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)])
        .nice()
        .range([height, 0]);

    // Add x-axis to the canvas
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis to the canvas
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .text("Species");

    // Add y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .text("Petal Length");

    // Define a function to calculate quartiles for each species
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;  
        const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(values), q3 + 1.5 * iqr);
        return { q1, median, q3, iqr, min, max };
    };

    // Calculate quartiles for each species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // quartilesBySpecies is a Map 
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        // Draw vertical line for whiskers (from min to max)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black");

        // Draw rectangular box (from q1 to q3)
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("stroke", "black")
            .attr("fill", "lightblue");

        // Draw horizontal line for the median
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black");
    });
});
