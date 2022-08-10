import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import styled from "styled-components";
import useStickyState from "../hooks/useStickyState";

export default function Home() {
  const [spend, setSpend] = useState(0);
  const [budget, setBudget] = useStickyState("budget", 1000);
  const [monthResetDate, setMonthResetDate] = useStickyState(
    "monthResetDate",
    28
  );
  const [clauds, setClauds] = useStickyState("clauds", false);

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

  let color = "lightgreen";

  let diffToBudget = Math.floor(todaysBudget) - spend;
  if (diffToBudget === 0) diffToBudget = false;
  let relativeToBudget = "ahead of";
  if (diffToBudget == 0) relativeToBudget = "spot on your";
  if (diffToBudget < 0) {
    relativeToBudget = "behind your";
    color = "orange";
  }
  if (diffToBudget < -99) color = "red";

  const daysLeft = 30 - daysPast;
  const newDailyBudget = (budget - spend) / daysLeft;
  const newWeeklyBudget = newDailyBudget * 7;

  useEffect(() => {
    if (clauds) {
      setMonthResetDate(20);
    } else {
      setMonthResetDate(28);
    }
  }, [clauds]);

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
        <Title className={styles.title}>Budget Tracker</Title>
        <Spacer />
        <Sunflower active={clauds}>🌻</Sunflower>
        <Switch>
          <SwitchInput
            type="checkbox"
            value={clauds}
            onChange={(e) => setClauds(e.target.checked)}
          />
          <Slider />
        </Switch>
        <Spacer />
        <InputWrapper>
          <Label>Your budget: </Label>
          <Input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            label="Budget"
            name="budget"
            type="number"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>Your spend: </Label>
          <Input
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            label="Spend"
            name="spend"
            type="number"
          />
        </InputWrapper>
        <Spacer />
        <Subheading>Initial Budget</Subheading>
        <Description>
          You can spend £{Math.floor(dailyBudget)} a day
        </Description>
        <Description>
          You can spend £{Math.floor(weeklyBudget)} a week
        </Description>
        <Spacer />
        <Subheading>Progress</Subheading>
        <Description>
          You are <Bold>{daysPast}</Bold> days into your budget period
        </Description>
        <Description>
          You have spent <Bold>{percentageSpend}%</Bold> of your budget
        </Description>
        <Description>
          Your budget up to today is <Bold>£{Math.floor(todaysBudget)}</Bold>
        </Description>
        <Spacer />
        <Description>
          Therefore you are{" "}
          <Color color={color}>
            {diffToBudget && <span>£</span>}
            {diffToBudget && Math.abs(diffToBudget)} {relativeToBudget} budget
          </Color>{" "}
          so far
        </Description>
        <Spacer />
        {diffToBudget > 49 && (
          <>
            <Subheading>Future</Subheading>
            <Description>
              You can now spend £{Math.floor(newDailyBudget)} a day / £
              {Math.floor(newWeeklyBudget)} a week
            </Description>
          </>
        )}
        {diffToBudget < -50 && (
          <>
            <Subheading>Future</Subheading>
            <Description>
              Try to spend less than £{Math.floor(newDailyBudget)} day / £
              {Math.floor(newWeeklyBudget)} week to get back on track
            </Description>
          </>
        )}
      </main>
    </div>
  );
}

const Title = styled.div``;

const InputWrapper = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label``;

const Input = styled.input`
  border: none;
  border-bottom: 1px solid grey;
  background: none;
  font-size: 16px;
  width: 100px;
`;

const Subheading = styled.div`
  font-weight: 500;
  font-size: 18px;
  margin-bottom: 7px;
`;

const Description = styled.div`
  margin-bottom: 3px;
  text-align: center;
`;

const Bold = styled.span`
  font-weight: 600;
`;

const Spacer = styled.div`
  margin: 20px;
`;

const Color = styled.span`
  color: ${(props) => props.color};
  font-weight: 500;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin-top: -5px;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccd6d8;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  :checked + ${Slider} {
    background-color: lightgreen;
  }

  &:checked + ${Slider}:before {
    transform: translateX(16px);
  }
`;

const Sunflower = styled.div`
  font-size: 40px;
  transition: 1s ease;
  transform: ${(props) => (props.active ? "scale(1)" : "scale(0.8)")};
`;
