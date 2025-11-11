(function ($) {
  const SIGNATURE_ENDPOINT = window.KURO_SIGNATURE_ENDPOINT || '/api/signatures/envelopes';

  async function submitSignature(form) {
    const $form = $(form);
    const $button = $form.find('button[type="submit"]');
    const $result = $('#signature-result');
    const originalText = $button.html();
    $result.addClass('d-none').removeClass('alert-danger alert-success alert-info');
    $button.prop('disabled', true);
    $button.html($button.data('loading-text') || 'Submitting...');

    const payload = {
      clientId: $form.find('input[name="client_id"]').val(),
      signerName: $form.find('input[name="signer_name"]').val(),
      signerEmail: $form.find('input[name="signer_email"]').val(),
      documentType: $form.find('select[name="document_type"]').val()
    };

    try {
      const response = await fetch(SIGNATURE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unable to start the signing session.');
      }

      $result.removeClass('d-none').addClass('alert-success');
      if (data.signingUrl) {
        $result.html(`Envelope created! <a href="${data.signingUrl}" target="_blank" rel="noopener">Open the signing room</a>.`);
      } else {
        $result.text('Envelope created! Check your email for the signing link.');
      }
      $form[0].reset();
    } catch (error) {
      $result.removeClass('d-none').addClass('alert-danger');
      $result.text(error.message);
    } finally {
      $button.prop('disabled', false);
      $button.html(originalText);
    }
  }

  $(function () {
    const $form = $('#signature_request_form');
    if (!$form.length) {
      return;
    }

    $form.on('submit', function (event) {
      event.preventDefault();
      submitSignature(this);
    });
  });
})(jQuery);
