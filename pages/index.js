import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useState } from "react";
import { DateTime } from "luxon";

export default function Home() {
  const [spend, setSpend] = useState(0);
  const [budget, setBudget] = useState(1000);
  const [monthResetDate, setMonthResetDate] = useState(28);

  const currentDate = DateTime.now();
  const startDate = DateTime.fromObject({
    day: monthResetDate,
    month: currentDate.month - 1,
  });

  const days = currentDate.diff(startDate, "days").toObject();

  const daysPast = Math.floor(days.days);

  const percentageSpend = Math.round((spend / budget) * 100);

  const dailyBudget = budget / 30;
  const weeklyBudget = dailyBudget * 7;
  const todaysBudget = dailyBudget * daysPast;

  return (
    <div className={styles.container}>
      <Head>
        <title>Budget Tracker</title>
        <meta
          name="description"
          content="Track how far through your budget you are"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Budget Tracker</h1>
        <label>Your budget</label>
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          label="Budget"
          name="budget"
          type="number"
        />
        <label>Your spend</label>
        <input
          value={spend}
          onChange={(e) => setSpend(e.target.value)}
          label="Spend"
          name="spend"
          type="number"
        />
        <div>You can spend £{Math.floor(dailyBudget)} a day</div>
        <div>You can spend £{Math.floor(weeklyBudget)} a week</div>
        <div>You are {daysPast} days into your budget period</div>
        <div>You have spent {percentageSpend}% of your budget </div>
        <div>Your budget up to today is £{Math.floor(todaysBudget)}</div>
        <div>
          Therefore you are £{Math.floor(todaysBudget) - spend} ahead of budget
          to date
        </div>
      </main>
    </div>
  );
}
