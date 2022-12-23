import { Form, useTransition } from "@remix-run/react";
import { FunctionComponent, useState } from "react";
import { Button } from "../Button/Button";
import DatePicker from "react-datepicker";
import InputMask from "react-input-mask";

interface CreateFormProps {}

interface DatePickerProps {
  onChange: (date: Date) => void;
  selected: Date;
}

export const CreateForm: FunctionComponent<CreateFormProps> = ({}) => {
  const transition = useTransition();

  const [showEnd, setShowEnd] = useState(false);
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [cost, setCost] = useState<string>("");

  return (
    <Form
      className={`mt-4`}
      method="post"
      action="/journey/new"
      encType="multipart/form-data"
      onReset={() => {
        setShowEnd(false);
        setStart(new Date());
      }}
    >
      <fieldset
        className="grid grid-cols-1 gap-4"
        disabled={transition.state === "submitting"}
      >
        <label className="grid grid-cols-2">
          Description
          <Input name="description" />
        </label>
        <label className="grid grid-cols-2">
          Cost
          <InputMask
            mask="999.99 €"
            alwaysShowMask
            className="dark:text-black dark:caret-black px-2 border-2 rounded border-ciblue-500 active:border-ciblue-500"
            onChange={(e) => {
              const {
                target: { value },
              } = e;

              const parsed = value.match(/(\d+).(\d{0,2})/);
              setCost(`${parsed![1]}.${parsed![2]}`);
            }}
          />
          <input name="cost" value={cost} hidden readOnly />
        </label>

        <label className="grid grid-cols-2">
          Start
          <input
            name="start_date"
            value={start.toISOString()}
            hidden
            readOnly
          />
          <Picker onChange={(date) => setStart(date)} selected={start} />
        </label>
        {showEnd ? (
          <label className="grid grid-cols-2">
            End
            <input name="end_date" value={end.toISOString()} hidden readOnly />
            <Picker onChange={(date) => setEnd(date)} selected={end} />
          </label>
        ) : (
          <div className="group transition duration-150 w-fit text-ciblue-500 items-center">
            <button onClick={() => setShowEnd(true)}>Add return date</button>
            <span className="block max-w-0 group-hover:max-w-full transition-all duration-150 h-0.5 bg-ciblue-300"></span>
          </div>
        )}

        <label className="block">
          <input
            type="file"
            name="attachment"
            className="block w-full text-sm text-slate-500 file:mr-2 file:py-2 file:cursor-pointer file:px-4 file:rounded-ml file:transition-color file:ease-in-out file:duration-300 file:border-0 file:text-sm file:text-white file:bg-ciblue-500 hover:file:bg-ciblue-700"
          />
        </label>
        <Button
          text={transition.state === "submitting" ? "Creating..." : "Create"}
          className="absolute bottom-4 mb-4"
          variant="solid"
        />
      </fieldset>
    </Form>
  );
};

const Input: FunctionComponent<{ name: string }> = ({ name }) => {
  return (
    <input
      name={name}
      className="dark:text-black dark:caret-black px-2 border-2 rounded border-ciblue-500 active:border-ciblue-500"
    />
  );
};

const Picker: FunctionComponent<DatePickerProps> = ({ onChange, selected }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      customInput={
        <input className="dark:text-black dark:caret-black px-2 border-2 rounded border-ciblue-500 active:border-ciblue-500 w-full" />
      }
    />
  );
};
