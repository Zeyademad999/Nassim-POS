import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import "../styles/ReportCard.css";

export default function ReportCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  subtitle,
  color = "blue",
  size = "default",
}) {
  const isPositiveTrend = trend === "up" || (trendValue && trendValue > 0);
  const isNegativeTrend = trend === "down" || (trendValue && trendValue < 0);

  return (
    <div className={`report-card ${size}`}>
      {/* Background decoration */}
      <div className={`card-background-decoration ${color}`} />

      <div className="card-header">
        <div className="card-content">
          {title ? (
            <h3 className="card-title">{title}</h3>
          ) : (
            <div className="loading-skeleton title-loading" />
          )}

          {value !== undefined ? (
            <p className={`card-value ${size}`}>{value}</p>
          ) : (
            <div className="loading-skeleton value-loading" />
          )}

          {subtitle && <p className="card-subtitle">{subtitle}</p>}

          {(trend || trendValue !== undefined) && (
            <div
              className={`card-trend ${
                isPositiveTrend
                  ? "trend-positive"
                  : isNegativeTrend
                  ? "trend-negative"
                  : "trend-neutral"
              }`}
            >
              {isPositiveTrend ? (
                <TrendingUp size={14} />
              ) : isNegativeTrend ? (
                <TrendingDown size={14} />
              ) : null}

              {trendValue !== undefined ? (
                <span>{Math.abs(trendValue)}% vs last period</span>
              ) : trend ? (
                <span>Trending {trend}</span>
              ) : null}
            </div>
          )}
        </div>

        <div className={`card-icon ${size} ${color}`}>
          {icon && (
            <>
              <div className={`pulse-effect ${color}`} />
              {React.cloneElement(icon, {
                size: size === "large" ? 28 : size === "small" ? 20 : 24,
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
