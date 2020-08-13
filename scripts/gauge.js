//data
function getRandomFloat(min, max) {
	let number = Math.random() * (max - min) + min;
	return +number.toFixed(1);
}

const data = {
	value: getRandomFloat(0, 100),
};

render();

window.addEventListener('resize', render);

function render() {
	let properties = {
		width: document.body.clientWidth,
		height: document.body.clientHeight,
		startAngle: -Math.PI / 2,
		endAngle: Math.PI / 2,
		arcDomain: [0, 100],
		colorDomain: [0, 50, 100],
		bgColor: '#eeeff0',
		colorOptions: ['#73d3ff', '#6794de', '#8f70ff'],
	};

	createVisualization(d3.select('#chart'), properties);
}

function createVisualization(container, props) {
	let {
		width,
		height,
		startAngle,
		endAngle,
		arcDomain,
		colorDomain,
		bgColor,
		colorOptions,
	} = props;

	const outerRadius = Math.min(width, height) / 3;
	const innerRadius = outerRadius * 0.6;
	const fontSize = innerRadius / 2.5;

	//chart
	const arcScale = d3
		.scaleLinear()
		.domain(arcDomain)
		.range([startAngle, endAngle]);

	const colorScale = d3.scaleLinear().domain(colorDomain).range(colorOptions);

	const arc = d3
		.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius)
		.startAngle(startAngle);

	let svg = container.selectAll('svg').data([null]);
	svg.exit().remove();
	svg = svg
		.enter()
		.append('svg')
		.merge(svg)
		.attr('width', width)
		.attr('height', height);

	let arcGroup = svg.selectAll('.arc-group').data([null]);
	arcGroup.exit().remove();
	arcGroup = arcGroup
		.enter()
		.append('g')
		.attr('class', 'arc-group')
		.merge(arcGroup)
		.attr('transform', translation(width / 2, height / 2));

	let backgroundArc = arcGroup.selectAll('.bg-arc').data([data]);
	backgroundArc.exit().remove();
	backgroundArc = backgroundArc
		.enter()
		.append('path')
		.attr('class', 'bg-arc')
		.merge(backgroundArc)
		.attr('d', (d) => {
			d.endAngle = endAngle;
			return arc(d);
		})
		.style('fill', bgColor);

	let dataArc = arcGroup.selectAll('.data-arc').data([data]);
	dataArc.exit().remove();
	dataArc = dataArc
		.enter()
		.append('path')
		.attr('class', 'data-arc')
		.merge(dataArc)
		.attr('d', (d) => {
			d.endAngle = startAngle;
			return arc(d);
		})
		.style('fill', colorScale(0));

	let dataText = arcGroup.selectAll('.data-text').data([null]);
	dataText.exit().remove();
	dataText = dataText
		.enter()
		.append('text')
		.attr('class', 'data-text')
		.text(0)
		.merge(dataText)
		.style('text-anchor', 'middle')
		.style('font-family', 'sans-serif')
		.style('font-size', fontSize)
		.style('fill', colorScale(0));

	//transition
	dataArc
		.transition()
		.duration(750)
		.style('fill', colorScale(data.value))
		.attrTween('d', arcTween(arcScale(data.value)));

	dataText.transition().duration(750).style('fill', colorScale(data.value));

	function arcTween(a) {
		return (d) => {
			let interpolate = d3.interpolate(d.endAngle, a);
			let count = d3.interpolate(0, data.value);
			return (t) => {
				if (interpolate(t) < endAngle) {
					d.endAngle = interpolate(t);
				} else {
					d.endAngle = endAngle;
				}
				dataText.text(+count(t).toFixed(1) + '%');
				return arc(d);
			};
		};
	}

	//ticks
	const markerLine = d3
		.lineRadial()
		.angle((d) => {
			return arcScale(d);
		})
		.radius((d, i) => {
			return i % 2 === 0 ? innerRadius : outerRadius;
		});

	let tickLines = arcGroup.selectAll('.lines').data(
		arcScale.ticks(5).map((d) => {
			return d;
		})
	);
	tickLines.exit().remove();
	tickLines = tickLines
		.enter()
		.append('path')
		.attr('class', 'lines')
		.merge(tickLines)
		.attr('d', (d) => {
			return markerLine([d, d]);
		})
		.style('stroke-width', 2)
		.style('stroke', '#fff');
}

//utils
function translation(x, y) {
	return `translate(${x}, ${y})`;
}
