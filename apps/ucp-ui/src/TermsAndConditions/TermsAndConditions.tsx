import React, { ReactNode } from "react";
import PageTitle from "../shared/components/PageTitle";
import PageContent from "../shared/components/PageContent";
import { Stack, Typography } from "@mui/material";

const Paragraph = ({ children }: { children: ReactNode }) => (
  <Typography variant="body1">{children}</Typography>
);

const SectionTitle = Paragraph;

const TermsAndConditions = () => {
  return (
    <PageContent>
      <Stack spacing={3.5}>
        <PageTitle>UCP Terms of Use</PageTitle>
        <Stack spacing={2}>
          <Paragraph>
            The Universal Connect Project (“UCP”) accepts, maintains, and makes
            available to you (“you”, “your”) and other UCP users data regarding
            data aggregator connections to individual financial institutions
            (“Connection Availability Data”), the performance of those
            connections (“Connection Performance Data”), and how to technically
            connect to those individual financial institutions (“Connection
            Code”) (collectively, “Connection Data”). Connection Data is
            provided to UCP on an entirely voluntary basis by you and other UCP
            users and is maintained and made available by UCP. By providing
            Connection Data or accessing the UCP, you acknowledge and agree to
            the following terms and conditions (the “Terms”):
          </Paragraph>
          <SectionTitle>Modification of Terms</SectionTitle>
          <Paragraph>
            UCP may update and modify these Terms at any time, after providing
            notice to you via your registered email address. UCP will make the
            latest version of the Terms available on the UCP website.
          </Paragraph>
          <SectionTitle>Access to Connection</SectionTitle>
          <Paragraph>
            You acknowledge and agree that your access to and use of the
            Connection Data is done on a completely voluntary basis and is
            subject to the limitations and obligations detailed in these Terms.
            You acknowledge that should UCP make available Connection
            Performance Data via a UCP-controlled server (the “Server”), your
            access to, and the uptime, availability and responsiveness of, the
            Server is not required for your deployment and use of the Universal
            Connect Widget.
          </Paragraph>
          <SectionTitle>Your Contributions of Connection Data</SectionTitle>
          <Paragraph>
            The utility and overall quality of the Connection Data improves with
            your contribution of Connection Data and the contribution of other
            users in a similar manner. We strongly encourage you to contribute
            Connection Data. You contribute Connection Data on a completely
            voluntary basis, but you acknowledge that you may need to configure
            your instance of the Universal Connect Widget so that Connection
            Performance Data is not shared with UCP. You agree that your
            contribution(s) of Connection Data are made without limitation on
            who may access or use it or how it may be later used. You grant UCP
            and UCP users the right to reproduce, display, adapt, enhance,
            aggregate, transmit, distribute and otherwise use any Connection
            Code you contribute. You agree that you will not be compensated for
            any such contributions.. When you contribute Connection Data to the
            UCP, you agree to do so in good faith, ensuring that all submissions
            are authorized, accurate, relevant, and intended to enhance the
            project&apos;s success, credibility, and integrity. You agree not to
            submit false, misleading, confidential, infringing, or otherwise
            improper data that could compromise the reliability of the platform.
          </Paragraph>
          <SectionTitle>No Confidential or Personal Information</SectionTitle>
          <Paragraph>
            You acknowledge and agree that the Connection Data contains no
            personal information, confidential information, or infringing
            components and that it may be freely disclosed by UCP, by you, or by
            other UCP users to third parties without restriction.
          </Paragraph>
          <SectionTitle>Representations and Warranties</SectionTitle>
          <Paragraph>
            The Server and Connection Data are provided &quot;as is&quot; and
            &quot;as available&quot;. To the maximum extent permitted by law,
            UCP and our partners, employees, and agents disclaim any and all
            warranties with respect to the Server and the Connection Data,
            including (i) any implied warranty of fitness for a particular
            purpose, merchantability, functionality, title, and
            non-infringement; (ii) representations and warranties that the
            Server or the Connection Data will meet your expectations or
            requirements, that the Server or the Connection Data will be secure,
            and that any errors in the technology will be corrected; (iii)
            representations and implied warranties arising from course of
            dealing and course of performance; (iv) any warranty that the Server
            or Connection Data will be secure, uninterrupted, timely,
            virus-free, or error-free; and (v) warranties related to the
            accuracy of any of the Connection Data, the results that may be
            obtained from the use of the Server or Connection Data, the
            correction of defects in the Connection Data, or that the Server
            will operate in combination with any other hardware or software.
            Your access to and use of the Server and the Connection Data are at
            your sole risk. Your reliance, and the results of such reliance, on
            the Server and Connection Data is solely at your risk, and you are
            solely responsible for any damage to your computer system or other
            device or loss of data that results from your use of the Server or
            Connection Data. The Server may not allow for error-free use, and
            interruptions, crashes, downtime, and delay in and by the Server may
            occur. UCP will not be responsible for such issues. No advice or
            information, whether oral or written, obtained by you from UCP
            through or from the Server or Connection Data will create any
            warranty not expressly stated in these terms. You represent and
            warrant that (i) the Connection Data and any other materials you
            provide will not contain any libelous or unlawful material or any
            malicious code or other materials or instructions that may cause
            harm or injury; (ii) the Connection Data and any other materials you
            provide will not violate any person’s right of privacy,
            confidentiality or copyright, trademark, or other intellectual
            property rights; (iii) you have all rights necessary to contribute
            Connection Data for the uses outlined in these Terms; and (iv) you
            have the legal power and authority to enter into and perform your
            obligations under these Terms.
          </Paragraph>
          <SectionTitle>Indemnity and Limitation of Liability</SectionTitle>
          <Paragraph>
            Indemnity. You agree, at your expense, to defend, indemnify, hold
            harmless, protect, and fully compensate UCP and its affiliates and
            respective partners and its and their officers, directors,
            employees, consultants, agents, distributors, partners, licensors,
            and third-party providers from any and all third-party claims,
            liability, damages, losses, expenses, and costs (including
            attorneys&apos; fees) caused by or arising from (a) a claim, action,
            or allegation of infringement based on your use of UCP or your
            submission of Connection Data, information, data, files, or other
            content to UCP; (b) your submission of Connection Data to UCP; (c)
            your use of the Server; (d) your fraud, manipulation, or other
            violation of applicable law; (e) your breach of these Terms; or (f)
            your gross negligence or willful misconduct.
          </Paragraph>
          <Paragraph>
            Limitation of liability. To the maximum extent permitted by law,
            UCP, its affiliates and partners, and its and their officers,
            directors, employees, consultants, agents, distributors, partners,
            licensors, and third-party providers shall not be liable to you or
            any third party for any damages, claims, or losses incurred,
            including compensatory, incidental, indirect, direct, special,
            punitive, consequential, or exemplary damages, however caused and
            whether based in contract, tort (including negligence), product
            liability or otherwise, including damages for telecommunication
            failures, loss, corruption, security or theft of data, viruses,
            spyware, loss of profits, business interruption, loss of business
            information, loss of privacy, or pecuniary loss arising out of your
            use or your inability to use the Server or access the Connection
            Data; arising in connection with your use of the Server or the
            Connection Data, including any interruption, inaccuracy, error, or
            omission in your use of the server; or any act or omission by UPC in
            administering the Server, even if we have been advised of the
            possibility of such damages, claims, or losses and even if a remedy
            set forth herein is found to have failed of its essential purpose.
            UCP assumes no responsibility for any damage caused by your access
            or inability to access the Server or the Connection Data.
          </Paragraph>
          <Paragraph>
            The limitations of damages set forth herein are fundamental elements
            of the basis of the agreement between UCP and you. UCP would not be
            able to provide access to the Server or the Connection Data without
            such limitations. This limitation of damages is agreed to by you and
            UCP and survives a failure of its essential purpose.
          </Paragraph>
          <SectionTitle>Miscellaneous Provisions</SectionTitle>
          <Paragraph>
            Feedback. Your feedback regarding UCP and the Connection Data is
            welcome. UCP may use any feedback you provide, without restriction,
            to improve UCP, as well as to create and improve other offerings,
            whether available at the time of feedback or not.
          </Paragraph>
          <Paragraph>
            UCP Modifications to the Server. UCP’s services may be modified at
            any time, with or without notice to you or other users. Such
            modification may result in decreased performance or availability and
            may even include temporary suspension or indefinite discontinuation
            of the Server by UCP.
          </Paragraph>
          <Paragraph>
            No Endorsements. Any marks, including names, logos, or other
            trademarks, contained in or associated with the Server or Connection
            Data that are not UCP marks are the trademarks of their respective
            owners. References to any names, marks, products, or services of
            third parties or hypertext links to third-party sites or information
            do not constitute or imply UCP’s endorsement, sponsorship,
            guarantee, or recommendation of the third party, information,
            products, or services.
          </Paragraph>
          <Paragraph>
            UCP Marks. You may not use any name, trademark, logo, or other
            official mark or emblem of UCP without UCP’s prior written consent,
            nor may you represent or imply an association or affiliation with
            UCP.
          </Paragraph>
          <Paragraph>
            Governing Law. These Terms and any disputes arising out of or
            related to these Terms will be governed by and construed in
            accordance with the laws of the State of Utah, without giving effect
            to its conflict of law rules, the United Nations Convention on
            Contracts for the International Sale of Goods, or the Uniform
            Computer Information Transactions Act.
          </Paragraph>
          <Paragraph>
            Severability. If any provision of these Terms is held by a court of
            competent jurisdiction to be contrary to law, the provision will be
            modified by the court and interpreted so as to best accomplish the
            objectives of the original provision to the fullest extent permitted
            by law, and the remaining provisions of these Terms will remain in
            full force and effect.
          </Paragraph>
        </Stack>
      </Stack>
    </PageContent>
  );
};

export default TermsAndConditions;
