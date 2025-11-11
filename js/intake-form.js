(function ($) {
  const API_ENDPOINT = window.KURO_INTAKE_ENDPOINT || '/api/intake';

  async function submitIntake(form) {
    const $form = $(form);
    const formBtn = $form.find('button[type="submit"]');
    const formResultSelector = '#form-result';
    $(formResultSelector).remove();
    formBtn.before('<div id="form-result" class="alert alert-success" role="alert" style="display:none;"></div>');
    const formResult = $(formResultSelector);
    const originalText = formBtn.html();
    formBtn.prop('disabled', true);
    formBtn.html(formBtn.data('loading-text') || 'Submitting...');

    const reminderChannels = [];
    if ($form.find('input[name="channel_email"]').is(':checked')) reminderChannels.push('email');
    if ($form.find('input[name="channel_sms"]').is(':checked')) reminderChannels.push('sms');
    if ($form.find('input[name="channel_whatsapp"]').is(':checked')) reminderChannels.push('whatsapp');

    const payload = {
      name: $form.find('input[name="form_name"]').val(),
      email: $form.find('input[name="form_email"]').val(),
      phone: $form.find('input[name="form_phone"]').val(),
      subject: $form.find('input[name="form_subject"]').val(),
      message: $form.find('textarea[name="form_message"]').val(),
      sourcePage: $form.data('source') || document.title,
      reminderOptIn: $form.find('input[name="reminder_opt_in"]').is(':checked'),
      whatsappOptIn: $form.find('input[name="channel_whatsapp"]').is(':checked'),
      visaExpiryDate: $form.find('input[name="visa_expiry_date"]').val(),
      reminderChannels: reminderChannels.length ? reminderChannels : ['email'],
      reminderType: $form.find('input[name="reminder_type"]').val() || 'Visa expiry'
    };

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        const detail = data.details ? Object.values(data.details).flat().find(Boolean) : null;
        const message = data.error || 'Failed to submit form.';
        throw new Error(detail ? `${message} ${detail}` : message);
      }

      $form.find('.form-control').val('');
      $form.find('input[type="checkbox"]').prop('checked', false);
      if (data.clientId) {
        $('#client-id-display .client-id').text(data.clientId);
        $('#client-id-display').removeClass('d-none');
      }
      formResult.removeClass('alert-danger').addClass('alert-success');
      formResult.html(data.message + (data.clientId ? ` Your Client ID is <strong>${data.clientId}</strong>.` : ''));
      formResult.fadeIn('slow');
      setTimeout(() => formResult.fadeOut('slow'), 8000);
    } catch (error) {
      formResult.removeClass('alert-success').addClass('alert-danger');
      formResult.html(error.message || 'Failed to submit form.');
      formResult.fadeIn('slow');
    } finally {
      formBtn.prop('disabled', false);
      formBtn.html(originalText);
    }
  }

  $(function () {
    if (!$('#contact_form').length) {
      return;
    }

    if ($.fn.validate) {
      $('#contact_form').validate({
        submitHandler: function (form) {
          submitIntake(form);
        }
      });
    } else {
      $('#contact_form').on('submit', function (event) {
        event.preventDefault();
        submitIntake(this);
      });
    }
  });
})(jQuery);
