/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect, useState, useRef } from "react";
import { DateTime } from "luxon";
import styled, { ThemeProvider } from "styled-components";
import useBudgetData from "../hooks/useBudgetData";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState("Tom");
  const [spend, setSpend] = useState(0);
  const [excludedFromBudget, setExcludedFromBudget] = useState(0);
  const [budget, setBudget] = useState(1000);
  const [customPeriod, setCustomPeriod] = useState(false);
  const [monthResetDate, setMonthResetDate] = useState(27);

  const { query, mutation } = useBudgetData(user);
  const { data, isLoading, isError } = query;
  const { mutate } = mutation;

  useEffect(() => {
    console.log("data changed", data);
    if (data) {
      setSpend(data.spend || 0);
      setExcludedFromBudget(data.excludedFromBudget || 0);
      setBudget(data.budget || 1000);
      setCustomPeriod(data.customPeriod || false);
      setMonthResetDate(data.monthResetDate || 27);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      mutate({
        userId: user,
        data: {
          spend,
          excludedFromBudget,
          budget,
          customPeriod,
          monthResetDate,
        },
      });
    }
  }, [spend, excludedFromBudget, budget, customPeriod, monthResetDate]);

  const currentDate = DateTime.now();
  let startDate = DateTime.fromObject({
    day: 1,
    month: currentDate.month,
  });

  if (customPeriod && monthResetDate > currentDate.day) {
    startDate = DateTime.fromObject({
      day: monthResetDate,
      month: currentDate.month - 1 < 1 ? 12 : currentDate.month - 1,
      year: currentDate.month - 1 < 1 ? currentDate.year - 1 : currentDate.year,
    });
  }

  if (customPeriod && monthResetDate <= currentDate.day) {
    startDate = DateTime.fromObject({
      day: monthResetDate,
      month: currentDate.month,
    });
  }

  const days = currentDate.diff(startDate, "days").toObject();

  console.log("days", days);

  const daysPast = Math.ceil(days.days);

  const actualSpend = spend - excludedFromBudget;

  const decimalSpend = actualSpend / budget;
  const percentageSpend = Math.round((actualSpend / budget) * 100);

  const dailyBudget = budget / currentDate.daysInMonth;
  const weeklyBudget = dailyBudget * 7;
  const todaysBudget = dailyBudget * daysPast;
  const decimalBudget = (todaysBudget / budget) * 100;

  let color = "lightgreen";
  let backgroundColor = "#daf8da";

  let diffToBudget = Math.floor(todaysBudget) - actualSpend;
  if (diffToBudget === 0) diffToBudget = false;
  let relativeToBudget = "ahead of";
  if (diffToBudget == 0) relativeToBudget = "spot on your";
  if (diffToBudget < 0) {
    relativeToBudget = "behind your";
    color = "orange";
    backgroundColor = "#ffe4be";
  }
  if (diffToBudget < -99) {
    color = "red";
    backgroundColor = "#ffdbd8";
  }

  const daysLeft = currentDate.daysInMonth - daysPast;
  const newDailyBudget = (budget - actualSpend) / daysLeft;
  const newWeeklyBudget = newDailyBudget * 7;

  const checkbox = useRef(null);

  const dates = [...Array(28).keys()];

  const markerPosition = decimalBudget * 2.77 + 58;

  useEffect(() => {
    checkbox.current.checked = customPeriod;
  }, [customPeriod]);

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
            }}
          >
            <Description tooLight={true} layout>
              Custom reset date?
            </Description>
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
              tooLight={true}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Label>Select a date</Label>
              <Select
                tooLight={true}
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
            <Label>Your total spend: </Label>
            <Input
              value={spend}
              onChange={(e) => setSpend(e.target.value)}
              label="Spend"
              name="spend"
              type="number"
            />
          </InputWrapper>
          <InputWrapper>
            <Label>excluded spend: </Label>
            <Input
              value={excludedFromBudget}
              onChange={(e) => setExcludedFromBudget(e.target.value)}
              label="excluded spend"
              name="excludedSpend"
              type="number"
            />
          </InputWrapper>
          <Spacer />
          <Description>
            You have spent{" "}
            <Bold>£{Math.floor(spend - excludedFromBudget)}</Bold> so far
          </Description>
          <Spacer />
          <motion.svg height="60" width="95%">
            <Line
              x1="15%"
              x2="100%"
              y1="50%"
              y2="50%"
              stroke="#e2e2e2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 0.85 }}
              transition={{
                type: "spring",
                stiffness: 100,
                restSpeed: 0.0001,
                restDelta: 0.0001,
              }}
            />
            <Line
              x1="15%"
              x2="87.2%"
              y1="50%"
              y2="50%"
              stroke={color}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: decimalSpend || 0 }}
              transition={{ type: "spring", bounce: 0, duration: 1.5 }}
            />
            <Marker
              initial={{ x1: 54, x2: 54 }}
              animate={{ x1: markerPosition || 54, x2: markerPosition || 54 }}
              transition={{
                type: "spring",
                stiffness: 150,
                mass: 1.3,
                damping: 12,
                restSpeed: 0.0001,
                restDelta: 0.0001,
              }}
              y1="36%"
              y2="64%"
              stroke="grey"
            />
          </motion.svg>
          <SummaryDescription
            tooLight={true}
            color={backgroundColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            You are{" "}
            <Bold color={color}>
              {diffToBudget && <span>£</span>}
              {diffToBudget && Math.abs(diffToBudget)}
            </Bold>{" "}
            {relativeToBudget} budget
          </SummaryDescription>
          <Spacer size={10} />
          <Description>
            You have{" "}
            <Bold>£{Math.floor(budget - (spend - excludedFromBudget))}</Bold>{" "}
            left in your budget
          </Description>
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
            You have <Bold>{daysLeft}</Bold> days left
          </Description>
          <Description>
            You have spent <Bold>{percentageSpend}%</Bold> of your budget
          </Description>
          <Description>
            Your budget up to today is <Bold>£{Math.floor(todaysBudget)}</Bold>
          </Description>
          <Spacer />
          {diffToBudget > 20 && daysLeft > 0 && (
            <>
              <Subheading>Future</Subheading>
              <Description>
                You can now spend £{Math.floor(newDailyBudget)} a day
              </Description>
            </>
          )}
          {diffToBudget < -20 && daysLeft > 0 && (
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
                You have £{Math.floor(budget - actualSpend)} left to spend
                today!
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
  color: ${(props) => (props.tooLight ? "black" : "")};
`;

const Bold = styled.span`
  font-weight: 600;
`;

const Spacer = styled.div`
  margin: ${(props) => (props.size ? props.size : 20)}px 0;
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
  color: ${(props) => (props.tooLight ? "black" : "white")};

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
  color: ${(props) => (props.tooLight ? "black" : "white")};
`;

const Everything = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 400px;
`;

const Line = styled(motion.line)`
  stroke-width: 10px;
  stroke-linecap: round;
  fill: transparent;
`;

const Marker = styled(motion.line)`
  stroke-linecap: round;
  stroke-width: 2px;
`;

const SummaryDescription = styled(motion.div)`
  padding: 10px 20px;
  background-color: ${(props) => props.color};
  border-radius: 12px;
  margin-top: -8px;
  transform: translateX(5px);
  margin-bottom: 20px;
  color: ${(props) => (props.tooLight ? "black" : "white")};
`;
