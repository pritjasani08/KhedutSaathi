const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend/src/pages/MarketHub/LivePrices/components/AdvancedMarketTable.jsx');
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  'function AdvancedMarketTable({ data = [], isLoading })', 
  'function AdvancedMarketTable({ data = [], isLoading, feedSummary, feedFarmer })'
);

content = content.replace(
  '  if (isLoading) {', 
`  const getBadgeClass = (label) => {
    if (label === 'Same District') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
    if (label === 'Recommended') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
    if (label === 'Nearby District') return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50';
    if (label === 'Same State') return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  if (isLoading) {`
);

const oldHeader = `          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Market Feed</h3>
          <p className="text-xs text-slate-500">Showing {processedData.length} records</p>`;

const newHeader = `          {feedSummary && feedFarmer ? (
            <>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                {feedFarmer.primaryCrop ? \`\${feedFarmer.primaryCrop} Markets Near You\` : 'Markets Near You'}
              </h3>
              <p className="text-sm font-medium text-slate-500 mb-1 capitalize">
                {feedFarmer.district}, {feedFarmer.state}
              </p>
              <p className="text-xs text-slate-400">
                Showing {feedSummary.recommendedMarkets} recommended markets out of {feedSummary.totalMarkets} total
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Market Feed</h3>
              <p className="text-xs text-slate-500">Showing {processedData.length} records</p>
            </>
          )}`;

content = content.replace(oldHeader, newHeader);

const oldTh = `<th className="p-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('market')}>`;
const newTh = `{feedSummary && (
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Relevance</th>
            )}
            <th className="p-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('market')}>`;
content = content.replace(oldTh, newTh);

const oldTdMarket = `                  <td className="p-4">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{row.market}</p>
                    <p className="text-xs text-slate-500 capitalize">{row.district}, {row.state}</p>
                  </td>`;
const newTdMarket = `                  <td className="p-4">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{row.market}</p>
                    <p className="text-xs text-slate-500 capitalize">{row.district}, {row.state}</p>
                  </td>
                  {feedSummary && (
                    <td className="p-4">
                      {row.matchLabel && row.matchLabel !== 'National' ? (
                        <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${getBadgeClass(row.matchLabel)}\`}>
                          {row.matchLabel}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Standard</span>
                      )}
                    </td>
                  )}`;
content = content.replace(oldTdMarket, newTdMarket);

const oldMobileHeader = `                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">{row.commodity}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{row.market} ({row.district})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">{row.arrival_date}</p>
                      </div>
                    </div>`;
                    
const newMobileHeader = `                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">{row.commodity}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{row.market} ({row.district})</p>
                        {feedSummary && row.matchLabel && row.matchLabel !== 'National' && (
                           <span className={\`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider \${getBadgeClass(row.matchLabel)}\`}>
                             {row.matchLabel}
                           </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">{row.arrival_date}</p>
                      </div>
                    </div>`;
                    
content = content.replace(oldMobileHeader, newMobileHeader);
content = content.replace('<td colSpan="5"', '<td colSpan={feedSummary ? 6 : 5}');

fs.writeFileSync(p, content);
console.log('AdvancedMarketTable updated successfully');
