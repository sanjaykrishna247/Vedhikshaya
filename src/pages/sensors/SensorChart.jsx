import { useEffect, useId, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

const MUTED = 0x5f7568;
const GRID = 0x012f13;

export default function SensorChart({ title, unit, color = '#8bc53d', data, icon: Icon, decimals = 1 }) {
  const rawId = useId();
  const domId = `sensorchart-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const rootRef = useRef(null);

  useEffect(() => {
    const root = am5.Root.new(domId);
    rootRef.current = root;
    root._logo?.dispose();
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: 'none',
        wheelY: 'none',
        paddingLeft: 0,
        paddingRight: 6,
        paddingTop: 6,
        paddingBottom: 0,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: 'minute', count: 5 },
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 55, minorGridEnabled: false }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxis.get('renderer').labels.template.setAll({ fontSize: 10, fill: am5.color(MUTED) });
    xAxis.get('renderer').grid.template.setAll({ strokeOpacity: 0.05, stroke: am5.color(GRID) });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        extraMax: 0.15,
        extraMin: 0.05,
      })
    );
    yAxis.get('renderer').labels.template.setAll({ fontSize: 10, fill: am5.color(MUTED) });
    yAxis.get('renderer').grid.template.setAll({ strokeOpacity: 0.07, stroke: am5.color(GRID) });

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        xAxis,
        yAxis,
        valueYField: 'value',
        valueXField: 'date',
        stroke: am5.color(color),
        fill: am5.color(color),
        tooltip: am5.Tooltip.new(root, {
          labelText: `{valueY.formatNumber('#.${'#'.repeat(decimals)}')} ${unit || ''}`,
          getFillFromSprite: false,
        }),
      })
    );
    series.strokes.template.setAll({ strokeWidth: 2 });
    series.fills.template.setAll({
      visible: true,
      fillGradient: am5.LinearGradient.new(root, {
        stops: [
          { opacity: 0.22 },
          { opacity: 0 },
        ],
        rotation: 90,
      }),
    });

    series.data.setAll(data);
    series.appear(700);
    chart.appear(700, 50);

    return () => root.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domId]);

  const latest = data[data.length - 1]?.value;

  return (
    <div className="d-card d-card--sensorchart">
      <div className="d-card__head">
        <div className="d-card__title">
          {Icon && (
            <span className="d-card__icon">
              <Icon />
            </span>
          )}
          <h3>{title}</h3>
        </div>
        {latest != null && (
          <span className="sensorchart__value">
            {latest.toFixed(decimals)}
            <small>{unit}</small>
          </span>
        )}
      </div>
      <div id={domId} className="sensorchart__canvas" />
    </div>
  );
}
