import React, { useRef, useEffect, useState } from "react";
import { select, scaleLinear, line, max, curveCardinal,
    axisBottom, axisLeft, brushX, event } from "d3";
import useResizeObserver from "./useResizeObserver";
import usePrevious from "./usePrevious";


function BrushChart({ data, children }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [selection, setSelection] = useState([0, 1.5]);
    const previousSelection = usePrevious(selection);

    // will be called initially and on every data change
    useEffect(() => {
        const svg = select(svgRef.current);
        const { width, height } = dimensions || wrapperRef.current.getBoundingClientRect();

        const xScale = scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width]);

        const yScale = scaleLinear()
            .domain([0, max(data)])
            .range([height, 0]);

        const lineGenerator = line()
            .x((d, idx) => xScale(idx))
            .y(d => yScale(d))
            .curve(curveCardinal);   

        svg
            .selectAll(".myLine")
            .data([data])
            .join("path")
            .attr("class", "myLine")
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("d", lineGenerator);

        svg
            .selectAll(".myDot")
            .data(data)
            .join("circle")
            .attr("class", "myDot")
            .attr("stroke", "black")
            .attr("r", (val, i) => i >= selection[0] && i <= selection[1] ? 4 : 2)
            .attr("fill", (val, i) => i >= selection[0] && i <= selection[1] ? "orange" : "black")
            .attr("cx", (val, index) => xScale(index))
            .attr("cy", yScale);

        // axes
        const xAxis = axisBottom(xScale);
        const yAxis = axisLeft(yScale);

        svg
            .select(".x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        svg.select(".y-axis").call(yAxis);

        const brush = brushX()
            .extent([  [0, 0],  [width, height]  ]) // brush allowed to stretch from top-left to bottom-right
            .on("start brush end", () => {
                if (event.selection && event.selection[0] !== event.selection[1]) {
                    const indexSelection = event.selection.map(xScale.invert); // convert array of pixel values to array of idx values
                    setSelection(indexSelection);
                }
            });

        // initial position + retaining position on resize
        if (previousSelection === selection) {
            // condition prevents loop between setSelection above & brush.move below
            svg
                .select(".brush")
                .call(brush)
                .call(brush.move, selection.map(xScale)); // 2nd arg is array of range
        }
    }, [data, dimensions, previousSelection, selection]);

    return (
        <React.Fragment>
            <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
                <svg ref={svgRef}>
                    <g className="x-axis" />
                    <g className="y-axis" />
                    <g className="brush" />
                </svg>
            </div>
            {children(selection)}
        </React.Fragment>
    );
}

export default BrushChart;