let sshCompromised = false;

function handleSSHCompromise() {
  sshCompromised = true;
  // Log to Google Analytics
  if (typeof ga !== 'undefined') {
    ga('send', 'event', 'Security', 'SSH Compromised', { nonInteraction: true });
  }
  // Log to Datadog
  if (typeof datadog !== 'undefined') {
    datadog.logger.error('SSH compromised, philosopher section disabled');
  }
  // Optionally, notify frontend via websocket or API
}

module.exports = {
  sshCompromised,
  handleSSHCompromise
}; 