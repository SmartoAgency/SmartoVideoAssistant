import FormMonster from './form/form.js';
import SexyInput from './input/input.js';
import i18next from 'i18next';
import * as yup from 'yup';

export default class FormView {
  constructor(container, formAction) {
    this._id = `form-${(Math.random() * 1000).toFixed(0)}`;
    this.inited = false;
    this.container = container || document.body;
    this.formAction = formAction;
    this.init();
  }

  init() {
    if (!this.inited) {
      this.container.insertAdjacentHTML('beforeend', this.getTemplate());
      window.addEventListener('form-open', () => {
        this.open();
      });
      window.addEventListener('click', (evt) => {
        if (evt.target.closest('.quiz-form-layout-close') === null) return;
        this.close();
      });
      window.addEventListener('click', (evt) => {
        if (evt.target.closest('[data-open-form]') === null) return;
        this.open();
      });

      this.initValidation();
      this.inited = true;
    }
  }

  close() {
    document.querySelector(`#${this._id}`).style.visibility = '';
    document.querySelector(`#${this._id}`).style.opacity = '';
    const form = document.querySelector(`#${this._id}`);
    const $title = form.querySelector('[data-success-title]');

    $title.textContent = $title.dataset.defaultTitle;
    form.classList.remove('form--success');
  }

  open() {
    document.querySelector(`#${this._id}`).style.visibility = 'visible';
    document.querySelector(`#${this._id}`).style.opacity = '1';
  }

  getTemplate() {
    return `
        <div class="toast-wrapper" data-toast-wrapper=""></div>
        <div class="quiz-form-layout" id="${this._id}">
            <div class="form"> 
                <!--<button class="quiz-form-layout-close" type="button"> </button>-->
                <div class="form__title" data-success-title="Thank you! We will get back to you soon" data-default-title="don't forget to leave your details and we will contact you">
                  don't forget to leave your details and we will contact you
                </div>
                <form data-home-contact="data-home-contact" autocomplete="off">
                <div class="form-field form-field-input" data-field-input="data-field-input" data-field-name="data-field-name" data-status="field--inactive">
                  <div class="input-message" data-input-message="data-input-message">Name:</div>
                    <input class="form-field__input" type="text" name="name" placeholder="Name"/>
                </div>
                <div class="form-field disabled form-field-input" data-field-input="data-field-input" data-field-phone="data-field-phone" data-status="field--inactive">
                    <div class="input-message" data-input-message="data-input-message">Phone:*</div>
                    <input class="form-field__input" type="text" name="phone" placeholder="Phone"/>
                </div>
                <div class="form-field disabled form-field-input" data-field-input="data-field-input" data-field-mail="data-field-mail" data-status="field--inactive">
                    <div class="input-message" data-input-message="data-input-message">Email:*</div>
                    <input class="form-field__input" type="text" name="mail" placeholder="Email"/>
                </div>
                <button class="form__submit" type="submit" data-btn-submit="data-btn-submit">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.6123 7.63568L11 7.99994L10.6123 8.3642L5.67969 13.0009L5.33691 12.6367L4.99512 12.2724L9.54004 7.99994L4.99512 3.72845L5.33691 3.3642L5.67969 2.99994L10.6123 7.63568Z" fill="white"/>
                  </svg>

                  <span class="form__submit-title">Send message</span>
                  <span class="link__text usn" data-btn-submit-text="data-btn-submit-text" style="display:none">Надіслати</span>
                </button>
                </form>
            </div>
        </div>
    `;
  }

  initValidation() {
    const $form = document.querySelector(`#${this._id} form`);
    const self = this;
    new FormMonster({
      formAction: self.formAction,
      elements: {
        $form,
        showSuccessMessage: false,
        successAction: () => {

          const form = document.querySelector(`#${this._id}`);
          const $title = form.querySelector('[data-success-title]');
          form.classList.add('form--success');

          $title.textContent = $title.dataset.successTitle;

          setTimeout(() => {
            self.close();
          }, 6000);

        },
        $btnSubmit: $form.querySelector('[data-btn-submit]'),
        fields: {
          name: {
            inputWrapper: new SexyInput({ animation: 'none', $field: $form.querySelector('[data-field-name]') }),
            rule: yup.string().required(i18next.t('required')).trim(),
            defaultMessage: i18next.t('name'),
            valid: false,
            error: [],
          },
          mail: {
            inputWrapper: new SexyInput({ animation: 'none', $field: $form.querySelector('[data-field-mail]') }),
            rule: yup.string().required(i18next.t('required')).trim(),
            defaultMessage: i18next.t('mail'),
            valid: false,
            error: [],
          },
          phone: {
            inputWrapper: new SexyInput({
              animation: 'none',
              $field: $form.querySelector('[data-field-phone]'),
              typeInput: 'phone',
            }),
            rule: yup
              .string()
              .required(i18next.t('required'))
              .min(17, i18next.t('field_too_short', { cnt: 20 - 8 })),
            defaultMessage: i18next.t('phone'),
            valid: false,
            error: [],
          },
        },
      },
    });
  }
}
