import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ConnectWidget from "./ConnectWidget";
import { allJobTypes, supportsJobTypeMap } from "../shared/constants/jobTypes";
import WidgetConfiguration from "./WidgetConfiguration";
import {
  AGGREGATORS,
  INSTITUTION_SELECTED,
  MEMBER_CONNECTED,
} from "./constants";
import { useAppDispatch } from "../shared/utils/redux";
import { addConnection, Connection } from "../shared/reducers/demo";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

interface FormValues {
  accountNumber: boolean;
  accountOwner: boolean;
  transactions: boolean;
  transactionHistory: boolean;
  aggregator: string;
}

interface JobTypeCheckbox {
  defaultValue?: boolean;
  name: keyof FormValues;
  label: string;
}

interface IframeMessage {
  type: string;
  metadata?: {
    name?: string;
    [key: string]: unknown;
  };
}

const Connect: React.FC = () => {
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(
    null,
  );
  const dispatch = useAppDispatch();

  const checkboxes: JobTypeCheckbox[] = allJobTypes.map((jobType) => ({
    name: jobType as keyof FormValues,
    label: supportsJobTypeMap[jobType].displayName,
    defaultValue: jobType === "accountNumber",
  }));

  const defaultValues = checkboxes.reduce(
    (acc, { defaultValue, name }) => ({
      ...acc,
      [name]: !!defaultValue,
    }),
    {
      aggregator: "mx",
    },
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    trigger,
    reset,
  } = useForm<FormValues>({
    defaultValues,
    mode: "onTouched",
  });

  const isJobTypeError = checkboxes.some(({ name }) => errors[name]);

  const triggerJobTypesValidation = () =>
    trigger(checkboxes.map(({ name }) => name));

  const validateAnyJobTypeSelected = (
    _value: string | boolean,
    formValues: FormValues,
  ): boolean => checkboxes.some(({ name }) => formValues[name]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setSubmittedValues(data);
  };

  const handleReset = () => {
    reset(defaultValues);
    setSubmittedValues(null);
  };

  // POST MESSAGE HANDLER

  const jobTypeDisplayNames = Object.entries(submittedValues || {})
    .filter(([key, value]) => key !== "aggregator" && value)
    .map(([key]) => supportsJobTypeMap[key as keyof FormValues].displayName);
  const aggregatorDisplayName =
    AGGREGATORS.find((agg) => agg.value === submittedValues?.aggregator)
      ?.label || submittedValues?.aggregator;
  const institutionNameRef = useRef("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessage>) => {
      if (event.origin !== WIDGET_DEMO_BASE_URL) {
        return;
      }

      const { type, metadata } = event.data;
      if (type === INSTITUTION_SELECTED) {
        institutionNameRef.current = metadata?.name || "";
      }

      if (type === MEMBER_CONNECTED) {
        const newConnection: Connection = {
          aggregator: aggregatorDisplayName || "",
          jobTypes: jobTypeDisplayNames,
          institution: institutionNameRef.current,
        };
        dispatch(addConnection(newConnection));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  if (submittedValues) {
    return (
      <ConnectWidget
        jobTypes={Object.entries(submittedValues)
          .filter(([key, value]) => key !== "aggregator" && value)
          .map(([key]) => key)}
        aggregator={submittedValues.aggregator}
        onReset={handleReset}
      />
    );
  }

  return (
    <WidgetConfiguration
      control={control}
      isJobTypeError={isJobTypeError}
      triggerJobTypesValidation={triggerJobTypesValidation}
      validateAnyJobTypeSelected={validateAnyJobTypeSelected}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
};

export default Connect;
