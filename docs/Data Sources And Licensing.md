# Data Sources And Licensing

## Overview

The Pressure platform uses open data from UK government sources. This document outlines the data sources, their licenses, and compliance requirements.

## UK Parliament Members API

### What We Use

- Member contact information (email addresses)
- Member names and titles
- Constituency information
- Party affiliations
- Current membership status

### License

**Open Parliament Licence v3.0**

Parliamentary information is made available under the [Open Parliament Licence v3.0](https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/).

### Attribution Requirements

**Required Statement:**

> Contains Parliamentary information licensed under the Open Parliament Licence v3.0.

This attribution statement must appear:

1. On every page of the website that displays Parliamentary information
2. In the project README
3. In any derivative works or applications

### Compliance Checklist

✅ Attribution statement included on frontend footer  
✅ Link to Open Parliament Licence provided  
✅ Attribution in README.md  
✅ Separate ATTRIBUTION.md file created  
✅ Non-endorsement disclaimer included  
✅ No personal data stored  
✅ Real-time API lookups only

### Permitted Uses

Under the Open Parliament Licence, you may:

- ✅ Copy, publish, and distribute the information
- ✅ Adapt the information
- ✅ Use commercially or non-commercially
- ✅ Combine with other information
- ✅ Include in your own applications

### Restrictions

You must NOT:

- ❌ Suggest official endorsement by Parliament
- ❌ Use the Royal Arms or Crowned Portcullis
- ❌ Store or process personal data from Parliamentary sources
- ❌ Remove or obscure the attribution

### No Warranty

Parliamentary information is provided "as is" without any warranties. The platform is not liable for:

- Errors or omissions in Parliamentary data
- Loss or damage caused by use of the information
- Interruption of data availability

## Postcode Validation

### What We Use

- Client-side UK postcode format validation using regex patterns
- No external API calls for postcode validation

### Implementation

The application uses a comprehensive regex pattern for validating UK postcode formats client-side. This means:

- ✅ No external API dependency for validation
- ✅ Instant validation without network latency
- ✅ No data sent to external services for format checking
- ✅ Works offline

**Note:** The Parliament API directly accepts postcodes for constituency lookup, so no separate postcode-to-constituency API is needed.

## API Usage Guidelines

### Rate Limiting

- **UK Parliament API**: No published rate limits, but be respectful

### Best Practices

1. **Cache responsibly** - Don't store personal data
2. **Handle errors gracefully** - APIs may be unavailable
3. **Attribute properly** - Always include required statements
4. **Respect privacy** - No tracking of individual lookups
5. **Be transparent** - Users should know where data comes from
6. **Client-side validation** - Use local validation before API calls

## Implementation

### Frontend Attribution

The footer of every page includes:

```html
Contains Parliamentary information licensed under the
<a
  href="https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/"
>
  Open Parliament Licence v3.0 </a
>.
```

### Code Comments

Parliamentary API client includes attribution:

```typescript
/**
 * UK Parliament API client for looking up MPs by postcode
 * Uses the official Parliament API: https://members-api.parliament.uk/
 *
 * Contains Parliamentary information licensed under the
 * Open Parliament Licence v3.0.
 */
```

### Non-Endorsement

The platform includes clear disclaimers:

- "Not endorsed by or affiliated with the UK Parliament"
- "This project is independent of the UK Government"

## For Forkers and Contributors

If you fork this project or create a derivative work:

1. **Keep the attribution** - It's required by the license
2. **Maintain the link** - Direct users to the Open Parliament Licence
3. **Don't claim endorsement** - Make it clear you're independent
4. **Update the year** - Keep copyright notices current
5. **Document changes** - If you modify how Parliamentary data is used

## Resources

- [Open Parliament Licence v3.0](https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/)
- [UK Parliament Copyright Information](https://www.parliament.uk/site-information/copyright-parliament/)
- [Members API Documentation](https://members-api.parliament.uk/index.html)

## Questions?

For questions about:

- **Parliamentary licensing** - Contact UK Parliament: copyright@parliament.uk
- **This project** - Open an issue on GitHub
- **Your derivative work** - Review the Open Parliament Licence terms

## Compliance Checklist for Deployments

Before deploying your campaign:

- [ ] Attribution statement visible on all pages with MP data
- [ ] Link to Open Parliament Licence included
- [ ] Non-endorsement disclaimer present
- [ ] No Parliamentary personal data stored
- [ ] Error handling respects API failures
- [ ] README includes attribution
- [ ] Footer includes required statement

## Updates and Changes

The UK Parliament may update the Open Parliament Licence. Current version: **v3.0**

Monitor for changes at: https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/

Last reviewed: October 2025
