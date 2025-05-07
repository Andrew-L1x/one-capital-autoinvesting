# Enable strong cryptography
[System.Security.Cryptography.RandomNumberGenerator]::Create()

# Set the random seed using a cryptographically secure method
$randomBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($randomBytes)
$env:RANDOM_SEED = [Convert]::ToBase64String($randomBytes)

# Verify the random seed is set
Write-Host "Random seed set to: $env:RANDOM_SEED" 