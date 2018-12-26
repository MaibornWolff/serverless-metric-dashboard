# How to use Azure's Monitor, Billing and Pricing API

### Get a temporary access token to use with the REST API

1. Use the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) to log in: `az login`. The returned json file contains the field "id" with the substriction id which is necessary to get a token (next step)
2. Retrieve an access token using `az account get-access-token --output json -s <substription-id> --resource https://management.azure.com/` with the replaced subscription id. "accessToken" contains the (very long) access token used for api requests later on

### Using Azure CLI

Does not work with the pricing API. Use `az monitor`/`az billing`. Examples for monitor can be found in this folder

## Request the price sheet

Request:

```
https://management.azure.com/subscriptions/<subscription-id>/providers/Microsoft.Commerce/RateCard?api-version=2016-08-31-preview&$filter=OfferDurableId eq 'MS-AZR-0003P' and Currency eq 'EUR' and Locale eq 'de-DE' and RegionInfo eq 'DE' 
```

Values after $filter can be adjusted for offers from other regions. You can request prices for each subscription type by changing the value of OfferDurableId ([available IDs](https://azure.microsoft.com/en-us/support/legal/offer-details/)).


Headers must contain the following fields containing the access token:
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

## Request Usage Information

```
https://management.azure.com/subscriptions/<subscription-id>/providers/Microsoft.Commerce/UsageAggregates?api-version=2015-06-01-preview&reportedStartTime=2018-10-01T00%3a00%3a00Z&reportedEndTime=2018-10-30T00%3a00%3a00Z&aggregationGranularity=Daily
```

The time (UTC) is encoded according to the ISO 8601 standard: `2018-10-31T13:48:28+00:00`. Colons equal %3a and + equals %2a (url encoded).

This query might return 0.0 although resources where used. This might have two reasons: 1. The API is unreliable and does not track every used resource 2. the monthly free executions haven't been fully used yet.