import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'blue' }) => {
  const colorMap = {
    blue: { iconBg: 'rgba(77, 131, 215, 0.15)', iconColor: '#4D83D7' },
    green: { iconBg: 'rgba(34, 164, 119, 0.15)', iconColor: '#22A477' },
    yellow: { iconBg: 'rgba(229, 162, 58, 0.15)', iconColor: '#E5A23A' },
    red: { iconBg: 'rgba(222, 89, 101, 0.15)', iconColor: '#DE5965' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="neu-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: 4 }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className="neu-inset"
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: scheme.iconBg
            }}
          >
            <Icon size={24} color={scheme.iconColor} />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
          {trend && (
            <span
              style={{
                fontWeight: 700,
                color: trend > 0 ? 'var(--success)' : (trend < 0 ? 'var(--danger)' : 'var(--secondary-text)')
              }}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span style={{ color: 'var(--secondary-text)' }}>
            {trendLabel || subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
