import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import initView from './form-view';

const sendForm = async (data, formAction) => {
  const response = await axios.post(formAction, data);
  return response.data;
};

const lang = 'en';
(async () => {
  await i18next.init({
    lng: lang,
    debug: true,
    resources: {
      uk: {
        translation: {
          name: 'Ім’я:*',
          phone: 'Телефон:*',
          send: 'Надіслати',
          sending: 'Відправлення',
          field_too_short: 'телефон повинен містити не менше {{cnt}} символів',
          field_too_long: 'телефон має містити не більше {{cnt}} символів',
          field_only_letter: 'ім`я повинно містити тільки букви',
          field_more_letter: 'ім`я повинно містити не більше 30 букв',
          only_number: 'тут лише цифри',
          required: 'це поле є обов`язковим',
          sendingSuccessTitle: 'Повідомлення надіслано',
          sendingSuccessText: 'Чекайте відповіді наших менеджерів',
          sendingErrorText: 'Чекайте відповіді наших менеджерів',
          sendingErrorTitle: 'Сталася помилка',
          send_fail: 'Повідомлення не було відправлено через невідому помилку сервера. Код: [send_fail] ',
          invalid_form: 'Повідомлення не було відправлено через невідому помилку сервера. Код: [invalid_form] ',
          front_error: 'Повідомлення не було відправлено через невідому помилку сервера. Код: [front_error] ',
          invalid_upload_file: 'Помилка завантаження файлу. Код: [invalid_upload_file]',
          invalid_recaptcha: 'Заповніть капчу і спробуйте ще раз знову. Код: [invalid_recaptcha]',
          connectionFailed: 'Помилка з\'єднання с CRM',
        },
      },
      en: {
        translation: {
          name: 'Name:*',
          phone: 'Phone:*',
          send: 'Send message',
          sending: 'Sending',
          field_too_short: 'phone must be at least {{cnt}} characters',
          field_too_long: 'phone must be at most {{cnt}} characters',
          field_only_letter: 'name must contain only letters',
          field_more_letter: 'name must be at most 30 letters',
          only_number: 'only digits here',
          required: 'this field is required',
          sendingSuccessTitle: 'Message sent',
          sendingSuccessText: 'Wait for the answers of our managers',
          sendingErrorText: 'Wait for the answers of our managers',
          sendingErrorTitle: 'An error has occurred',
          send_fail: 'The message was not sent due to an unknown server error. Code: [send_fail] ',
          invalid_form: 'The message was not sent for an unknown server error. Code: [invalid_form] ',
          front_error: 'The message was not sent for an unknown server error. Code: [front_error] ',
          invalid_upload_file: 'Error uploading file. Code: [invalid_upload_file] ',
          invalid_recaptcha: 'Please fill in the captcha and try again. Code: [invalid_recaptcha] ',
          connectionFailed: 'Server connection error',
        },
      },
    },
  });
})();

export default class FormMonster {
  constructor(setting) {
    this.elements = setting.elements;
    this.$body = document.querySelector('body');
    this.showSuccessMessage = setting.showSuccessMessage || true;
    this.formAction = setting.formAction || '/wp-admin/admin-ajax.php';

    this.state = {
      serverError: null,
      error: true,
      form: setting.elements.fields,
      status: 'filling',
    };
    this.fieldsKey = Object.keys(this.elements.fields);
    this.watchedState = initView(this.state, this.elements);

    this.init();
  }

  validate(formData) {
    const formDataObj = this.fieldsKey.reduce((acc, key) => {
      acc[key] = formData.get(key);
      return acc;
    }, {});
    const shapeObject = this.fieldsKey.reduce((acc, key) => {
      acc[key] = this.elements.fields[key].rule;
      return acc;
    }, {});
    const schema = yup.object().shape(shapeObject);
    try {
      schema.validateSync(formDataObj, { abortEarly: false });
      return null;
    } catch (err) {
      return err.inner;
    }
  }

  changeInput() {
    return (e) => {
      e.preventDefault();
      this.watchedState.status = 'filling';
      const formData = new FormData(this.elements.$form);
      const error = this.validate(formData);
      this.fieldsKey.map((key) => {
        const field = this.elements.fields[key];
        field.valid = true;
        field.error = [];
        return null;
      });
      if (error) {
        error.forEach(({ path, message }) => {
          this.watchedState.form[path].valid = false;
          this.watchedState.form[path].error.push(message);
          return null;
        });
        this.watchedState.error = true;
        this.watchedState.status = 'renderErrorValidation';
        return null;
      }
      this.watchedState.error = false;
      this.watchedState.status = 'renderSuccessValidation';
      return null;
    };
  }

  submitForm() {
    return async (e) => {
      e.preventDefault();
      this.changeInput()(e);
      if (this.watchedState.error === false) {
        try {
          this.watchedState.status = 'loading';
          const formData = new FormData(this.elements.$form);
          formData.append('action', 'app');
          const { error, code_error } = await sendForm(formData, this.formAction);
          if (error === 0) {
            this.watchedState.status = 'successSand';
            return true;
          }
          this.watchedState.serverError = code_error;
          this.watchedState.status = 'failed';
        } catch (err) {
          this.watchedState.error = err.message;
          this.watchedState.serverError = 'front_error';
          this.watchedState.status = 'failed';
        }
      }
      return null;
    };
  }

  listers() {
    this.elements.$form.addEventListener('submit', this.submitForm(this.watchedState));
    this.fieldsKey.map((key) => {
      const { input } = this.elements.fields[key].inputWrapper;
      input.addEventListener('input', this.changeInput(this.watchedState));
      return null;
    });
  }

  init() {
    this.listers();
  }
}
