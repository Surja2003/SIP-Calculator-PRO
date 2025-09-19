const Disclaimer = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800/60 border-t border-gray-200/70 dark:border-gray-700 mt-10">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <strong>Disclaimer</strong>
          <span> : </span>
          <em>We DO NOT offer any financial advice here. It should be used only for informational purpose.</em>
          <br />
          Investment in mutual funds or any asset class comes with an inherent risk. It’s just a web based tool for getting a rough estimate about the future value on your SIP investments. The calculations are based on projected annual returns. The <em>actual annual returns</em> may be higher or lower than the estimated value. And it may have significant impact on the final returns. So, <em>do your own analysis or hire a financial advisor/planner before making any decision.</em>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
