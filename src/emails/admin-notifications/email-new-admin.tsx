import {
    Body,
    Container,
    Head,
    Html,
    Section,
    Tailwind,
    Text,
  } from "@react-email/components";
  
  type EmailNewAdminProps = {
    toName: string;
    url: string;
  };
  
  const EmailNewAdmin = ({ toName, url }: EmailNewAdminProps) => {
    return (
      <Html>
        <Head />
        <Tailwind>
          <Body className="font-sans m-8 text-center">
            <Container>
              <Section>
                <Text>
                  Hello {toName}, A new User has been created.LogIn to activate their account to Admin Status
                </Text>
              </Section>
              <Section>
                <Text className="bg-black rounded text-white p-2 m-2">
                  {url}
                </Text>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  };
  
  EmailNewAdmin.PreviewProps = {
    toName: "Samuel Oghogho",
    url: "https://datima-specialist-clinics.com/admin",
  } as EmailNewAdminProps;
  
  export default EmailNewAdmin;
  