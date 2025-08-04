import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, HelpCircle, Building, Briefcase } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import Chatbot from '../components/Chatbot';

const MainPage = () => {
  // UI State
  const [companyName, setCompanyName] = useState("Tech Solutions Inc.");
  const [industry, setIndustry] = useState("Software Development");
  const [employees, setEmployees] = useState(120);
  const [revenueGrowthRate, setRevenueGrowthRate] = useState(8);
  const [totalInvestment, setTotalInvestment] = useState(2000000);
  const [annualRevenue, setAnnualRevenue] = useState(10000000);
  const [profitMargin, setProfitMargin] = useState(15);
  const [roiPercentage, setRoiPercentage] = useState(25);

  const updateField = (field, value) => {
    switch (field) {
      case "companyName": 
        setCompanyName(value); 
        break;
      case "industry": 
        setIndustry(value); 
        break;
      case "employees": 
        setEmployees(Number(value)); 
        break;
      case "revenueGrowthRate": 
        setRevenueGrowthRate(Number(value)); 
        break;
      case "totalInvestment": 
        setTotalInvestment(Number(value)); 
        break;
      case "annualRevenue": 
        setAnnualRevenue(Number(value)); 
        break;
      case "profitMargin": 
        setProfitMargin(Number(value)); 
        break;
      case "roiPercentage": 
        setRoiPercentage(Number(value)); 
        break;
      default:
        console.warn("Unknown field:", field);
    }
  };

  // Chart Data Generators
  const generateRevenueData = () => {
    const baseYear = new Date().getFullYear() - 4;
    const baseRevenue = 6;
    return Array.from({ length: 5 }, (_, i) => ({
      year: baseYear + i,
      revenue: Math.round((baseRevenue + (i * 1.2) + (revenueGrowthRate / 10)) * 10) / 10
    }));
  };

  const generateProfitMarginData = () => ([
    { quarter: 'Q1', margin: Math.max(10, profitMargin - 3) },
    { quarter: 'Q2', margin: Math.max(12, profitMargin - 1) },
    { quarter: 'Q3', margin: profitMargin },
    { quarter: 'Q4', margin: Math.min(25, profitMargin + 1) }
  ]);

  const [revenueData, setRevenueData] = useState(generateRevenueData());
  const [profitMarginData, setProfitMarginData] = useState(generateProfitMarginData());

  // Update derived values when inputs change
  useEffect(() => {
    const baseRevenue = employees * 10000;
    const growthAdjustedRevenue = baseRevenue * (1 + (revenueGrowthRate - 8) * 0.1);
    setAnnualRevenue(Math.round(growthAdjustedRevenue));

    const calculatedProfitMargin = Math.max(10, Math.min(25, 15 + (revenueGrowthRate - 8) * 0.5));
    setProfitMargin(Math.round(calculatedProfitMargin * 10) / 10);

    const netProfit = growthAdjustedRevenue * (calculatedProfitMargin / 100);
    const calculatedROI = (netProfit / totalInvestment) * 100;
    setRoiPercentage(Math.round(calculatedROI * 10) / 10);

    setRevenueData(generateRevenueData());
    setProfitMarginData(generateProfitMarginData());
  }, [employees, revenueGrowthRate, totalInvestment, profitMargin]);

  // UI Context (passed to Chatbot)
  const uiContext = {
    textData: {
      companyName,
      industry,
      employees,
      annualRevenue,
      revenueGrowthRate,
      profitMargin,
      totalInvestment,
      roiPercentage,
      helpText: "ROI is calculated as (Net Profit / Investment) * 100"
    },
    visualData: {
      revenueChart: {
        type: "line_chart",
        title: "Revenue over last 5 years",
        data: revenueData,
        description: `Line chart showing revenue growth from $${revenueData[0]?.revenue}M to $${revenueData[revenueData.length-1]?.revenue}M`
      },
      profitMarginChart: {
        type: "bar_chart",
        title: "Profit margin trend",
        data: profitMarginData,
        description: `Bar chart showing quarterly profit margins: ${profitMarginData.map(d => `${d.quarter}: ${d.margin}%`).join(', ')}`
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">ROI Calculator Dashboard</h1>
        <p className="text-center text-gray-600 mb-8">AI Copilot with Text + Visual Understanding</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* UI Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 text-blue-600" />
                Company Summary
              </h2>
              
              {/* Company Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Building className="mr-1 w-4 h-4 text-gray-500" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => {setCompanyName(e.target.value);}}
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Briefcase className="mr-1 w-4 h-4 text-gray-500" />
                    Industry
                  </label>
                    <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter industry"
                  />
                </div>

                {/* Number of Employees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Users className="mr-1 w-4 h-4 text-gray-500" />
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    value={employees}
                    onChange={(e) => setEmployees(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter employee count"
                    min="1"
                  />
                </div>

                {/* Annual Revenue (Calculated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign className="mr-1 w-4 h-4 text-gray-500" />
                    Annual Revenue (Calculated)
                  </label>
                  <div className="w-full p-3 bg-green-50 border border-green-200 rounded text-green-800 font-semibold">
                    ${(annualRevenue / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>

              {/* Company Overview Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-blue-900 mb-2">Company Overview</h3>
                <div className="text-sm text-blue-800">
                  <span className="font-medium">{companyName}</span> operates in the{" "}
                  <span className="font-medium">{industry}</span> sector with{" "}
                  <span className="font-medium">{employees}</span> employees, generating{" "}
                  <span className="font-medium">${(annualRevenue / 1000000).toFixed(1)}M</span> in annual revenue.
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="mr-2 text-green-600" />
                Financial Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue Growth Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={revenueGrowthRate}
                      onChange={(e) => setRevenueGrowthRate(parseFloat(e.target.value) || 0)}
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profit Margin (Calculated)
                  </label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded font-semibold text-green-800">
                    {profitMargin}%
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3 text-gray-700">Revenue Trend (5 Years)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsLineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}M`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3 text-gray-700">Profit Margin by Quarter</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsBarChart data={profitMarginData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Profit Margin']} />
                      <Bar dataKey="margin" fill="#10B981" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ROI Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="mr-2 text-purple-600" />
                ROI Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Investment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      value={totalInvestment}
                      onChange={(e) => setTotalInvestment(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 p-3 border rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter investment amount"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ROI Percentage (Calculated)
                  </label>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded text-lg font-bold text-purple-700">
                    {roiPercentage}%
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <HelpCircle className="mr-2 mt-0.5 text-blue-600" />
                  <div>
                    <span className="font-medium text-blue-900">Calculation:</span>
                    <p className="text-blue-800 mt-1">
                      ROI = (Net Profit / Investment) × 100<br />
                      Net Profit = Annual Revenue × Profit Margin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot */}
          <Chatbot 
            uiContext={uiContext} 
            updateField={updateField}
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;