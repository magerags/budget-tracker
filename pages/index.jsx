import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect, useState, useRef } from "react";
import { DateTime } from "luxon";
import styled from "styled-components";
import useStickyState from "../hooks/useStickyState";
import { motion } from "framer-motion";

export default function Home() {
  const [spend, setSpend] = useState(0);
  const [budget, setBudget] = useStickyState("budget", 1000);
  const [customPeriod, setCustomPeriod] = useStickyState("customPeriod", false);
  const [monthResetDate, setMonthResetDate] = useStickyState(
    "monthResetDate",
    20
  );

  const currentDate = DateTime.now();
  let startDate = DateTime.fromObject({
    day: 1,
    month: currentDate.month,
  });

  if (customPeriod && monthResetDate > currentDate.day) {
    startDate = DateTime.fromObject({
      day: monthResetDate,
      month: currentDate.month - 1,
    });
  }

  if (customPeriod && monthResetDate <= currentDate.day) {
    startDate = DateTime.fromObject({
      day: monthResetDate,
      month: currentDate.month,
    });
  }

  const days = currentDate.diff(startDate, "days").toObject();

  const daysPast = Math.floor(days.days);

  const percentageSpend = Math.round((spend / budget) * 100);

  const dailyBudget = budget / currentDate.daysInMonth;
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

  const daysLeft = currentDate.daysInMonth - daysPast;
  const newDailyBudget = (budget - spend) / daysLeft;
  const newWeeklyBudget = newDailyBudget * 7;

  const checkbox = useRef(null);

  const dates = [...Array(28).keys()];

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
        <Title className={styles.title} layout>
          Budget Tracker
        </Title>
        <Spacer />
        <OptionBox
          layout
          transition={{
            type: "spring",
          }}
        >
          <SwitchWrapper
            layout
            onClick={() => {
              setCustomPeriod(!customPeriod);
              checkbox.current.checked = !customPeriod;
            }}
          >
            <Description layout>Custom reset date?</Description>
            <Switch layout>
              <SwitchInput
                layout
                disabled="true"
                ref={checkbox}
                type="checkbox"
                value={customPeriod}
              />
              <Slider />
            </Switch>
          </SwitchWrapper>
          {customPeriod && (
            <DateSelectWrapper
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Label>Select a date</Label>
              <Select
                value={monthResetDate}
                onChange={(e) => setMonthResetDate(e.target.value)}
              >
                {dates.map((n) => {
                  return (
                    <Option key={n + 1} value={n + 1}>
                      {n + 1}
                    </Option>
                  );
                })}
              </Select>
            </DateSelectWrapper>
          )}
        </OptionBox>
        <Spacer />
        <Everything layout>
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
          {diffToBudget > 49 && daysLeft > 0 && (
            <>
              <Subheading>Future</Subheading>
              <Description>
                You can now spend £{Math.floor(newDailyBudget)} a day
              </Description>
            </>
          )}
          {diffToBudget < -50 && daysLeft > 0 && (
            <>
              <Subheading>Future</Subheading>
              <Description>
                Try to spend less than £{Math.floor(newDailyBudget)} day
              </Description>
            </>
          )}
          {daysLeft == 0 && diffToBudget > 1 && (
            <>
              <Subheading>Future</Subheading>
              <Description>
                You have £{Math.floor(budget - spend)} left to spend today!
              </Description>
            </>
          )}
        </Everything>
      </main>
    </div>
  );
}

const Title = styled(motion.div)``;

const InputWrapper = styled(motion.div)`
  margin-bottom: 10px;
`;

const Label = styled(motion.label)``;

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

const Description = styled(motion.div)`
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

const Switch = styled(motion.label)`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
`;

const Slider = styled(motion.span)`
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

const SwitchInput = styled(motion.input)`
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

const OptionBox = styled(motion.div)`
  padding: 15px 20px;
  border-radius: 15px;
  background-color: #e4f1f3;
  width: 280px;
`;

const SwitchWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    cursor: pointer;
  }
`;

const Select = styled.select`
  width: 15.5%;
  background-color: transparent;
  border: none;
  font-size: 15px;
  margin-right: 2px;

  &:focus {
    outline: none;
  }

  &:active {
    outline: none;
  }
`;

const Option = styled.option``;

const DateSelectWrapper = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const Everything = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
