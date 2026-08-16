# CLOUD FORENSICS AUTOMATION

## Overview

Cloud Forensics Automation is a cloud security project designed to automate the collection, analysis, and preservation of digital evidence during security incidents in Amazon Web Services (AWS). As organization workloads migrate to the cloud, manual forensic acquisition can be slow, error-prone, and inconsistent across distributed environments.

This project implements an event-driven automation framework that leverages AWS native security and compute services. When security-relevant actions or unauthorized activity are logged by AWS CloudTrail, Python scripts executing within AWS Lambda parse log data, evaluate events against predefined regular expression (Regex) detection rules, and trigger automated containment and evidence preservation routines.

By automating evidence gathering, the workflow minimizes manual response lag, ensures critical logs and artifacts are preserved in dedicated Amazon Simple Storage Service (S3) buckets, and establishes a repeatable forensic baseline suitable for SOC analysis and Incident Response (IR) triage.

---

## Problem Statement

In cloud environments, traditional digital forensics and incident response (DFIR) practices face unique operational challenges:

* **Ephemeral Infrastructure:** Cloud instances can be terminated, modified, or auto-scaled away rapidly, causing potential loss of volatile evidence and system artifacts.
* **Delayed Response Times:** Manual identification of suspicious activity and subsequent manual evidence collection introduce lag, allowing compromised assets to be altered or evidence destroyed.
* **Inconsistent Collection:** Performing manual log downloads and volume snapshots without automated controls increases the risk of human error, missing logs, or improper evidence handling.

This project addresses these challenges by establishing a programmatic, rule-based response workflow that identifies suspicious activity from audit logs and automatically preserves evidence in centralized storage.

---

## Architecture / Workflow

```
[ AWS Environment Activity ]
             │
             ▼
   [ AWS CloudTrail ]  ──── (Collects & outputs event API logs)
             │
             ▼
     [ AWS Lambda ]    ──── (Runs Python 3 + Boto3 automation script)
             │
             ├──────────────────────┐
             ▼                      ▼
  [ Regex Rule Engine ]   [ Evidence Preservation ]
  (Identifies suspicious    ├─ Amazon S3 (Secure log/artifact storage)
   patterns in payload)     └─ EBS Snapshots (Disk volume state capture)*
                                    │
                                    ▼
                         [ Security Notification ]*
                         (Alert dispatch via Slack webhook)
```

*\* Note: EBS snapshots, KMS encryption, and Slack notifications are subject to configuration scope as noted in the Implementation section.*

---

## Key Features

* **Centralized Security Audit Logging:** Captures management and data plane event logs using AWS CloudTrail.
* **Automated Log Analysis:** Uses Python 3 and the Boto3 SDK to process structured JSON event records.
* **Rule-Based Pattern Detection:** Implements regular expression matching to detect suspicious API calls, unauthorized access attempts, and configuration changes.
* **Event-Driven Forensic Response:** Executes serverless response logic via AWS Lambda upon detecting target event patterns.
* **Secure Artifact Storage:** Preserves collected logs and evidence payloads in restricted Amazon S3 buckets.
* **Least-Privilege Identity Management:** Implements granular IAM roles and resource policies to control access between AWS services.

---

## Technologies Used

* **Cloud Services:** AWS CloudTrail, AWS Lambda, Amazon S3, Amazon EC2 / EBS (Snapshots)
* **Automation & Scripting:** Python 3, Boto3 (AWS SDK for Python)
* **Detection & Logic:** Regular Expressions (Regex)
* **Identity & Security:** AWS Identity and Access Management (IAM), AWS Key Management Service (KMS)*
* **Integrations:** Slack Webhooks (Notifications)*

---

## Implementation

### 1. Event Collection (AWS CloudTrail)
AWS CloudTrail is configured to log account activity, API calls, and administrative operations. CloudTrail acts as the primary data source, capturing JSON-formatted event records containing details such as event names, source IP addresses, user identities, and timestamps.

### 2. Log Processing & Detection Logic (Python 3, Boto3 & Regex)
Custom Python scripts utilizing the `boto3` library handle log ingestion and structure analysis. The detection layer employs compiled regular expressions (`re` module) to scan event payloads for target indicators of compromise (IOCs) or policy violations, such as:
* Unauthorized privilege escalation attempts (`AttachUserPolicy`, `CreateAccessKey`)
* Security group modifications opening sensitive ports (`AuthorizeSecurityGroupIngress`)
* Critical resource deletions or modification calls

### 3. Automated Execution (AWS Lambda)
AWS Lambda acts as the execution environment for response tasks. When invoked, the Lambda function evaluates incoming log data against the detection rules. Upon a positive rule match, Boto3 API calls execute evidence collection steps automatically without requiring interactive host logins.

### 4. Evidence Preservation (Amazon S3 & EBS Snapshots)
* **Amazon S3:** Collected log extracts and execution metadata are written to dedicated S3 buckets configured with restrictive access policies to prevent tampering.
* **EBS Snapshots:** Where volume snapshotting is enabled in the response script, Boto3 calls trigger `create_snapshot` for attached Elastic Block Store (EBS) volumes to preserve point-in-time disk states for downstream forensic analysis.

### 5. Access & Identity Control (AWS IAM)
IAM execution roles strictly govern service interactions. The Lambda execution role is assigned granular policies defining explicit `Allow` statements only for necessary actions (`s3:PutObject`, `ec2:CreateSnapshot`, `logs:CreateLogGroup`), maintaining strict operational boundaries.

---

## Security Considerations

* **Principle of Least Privilege:** The Lambda execution role is restricted exclusively to required API operations, avoiding generic administrative permissions.
* **Isolated Evidence Storage:** Evidence storage buckets in S3 are separated from operational environments, enforcing strict bucket policies.
* **Auditability:** All automated response actions taken by Boto3 generate corresponding audit logs in CloudTrail, ensuring full traceability of forensic operations.

---

## Challenges & Solutions

### Challenge 1: Handling Complex JSON Structures in CloudTrail Logs
* **Problem:** CloudTrail log payloads contain deeply nested JSON arrays and varying schema structures depending on the calling service.
* **Solution:** Developed modular Python helper functions to safely extract key fields (e.g., `eventName`, `userIdentity`, `sourceIPAddress`) with fallback handling for missing attributes.

### Challenge 2: Scoping IAM Permissions Safely
* **Problem:** Overly broad permissions risk allowing the Lambda function to inadvertently modify production assets.
* **Solution:** Authored custom IAM policies line-by-line, restricting resource ARNs and specific API actions strictly to evidence preservation operations.

---

## What I Learned

* Programmatic interaction with AWS services using Python 3 and Boto3.
* Log parsing and pattern extraction using Regular Expressions (Regex).
* Architecture patterns for serverless event-driven security workflows.
* Cloud audit log analysis and forensic event identification using AWS CloudTrail.
* Scoping granular IAM roles and policies following cybersecurity best practices.

---

## Future Improvements

Features planned for future iterations or optional enhancements:

* **AWS KMS Encryption:** Enforcing server-side encryption with customer-managed keys (SSE-KMS) on all evidence storage S3 buckets.
* **Real-time Alerting:** Integrating Slack or Amazon SNS webhooks for real-time security team notification upon evidence capture.
* **Automated Memory Acquisition:** Extending response scripts to trigger agent-based memory dumps (e.g., via AWS Systems Manager Run Command).
* **Automated Containment:** Adding isolation actions such as dynamically applying quarantine security groups to affected EC2 instances.

---

## GitHub Portfolio Summary

* **Engineered an automated cloud forensic response workflow** in AWS using CloudTrail, Python 3, Boto3, and AWS Lambda to identify security events and preserve digital evidence.
* **Implemented rule-based detection logic** leveraging Regular Expressions (Regex) to parse structured event logs and flag unauthorized API calls and configuration changes.
* **Automated evidence preservation routines**, writing forensic log payloads to restricted Amazon S3 buckets and triggering EBS volume snapshots for disk state capture.
* **Enforced least-privilege security controls** by scoping granular AWS IAM execution roles and policies for all automated serverless actions.
