-- The separate USD 29 eligibility check is retired in favour of one EUR price
-- ladder on /readiness-check: Basic EUR 2.99 -> Premium EUR 19 (expert report)
-- -> Full application service (Premium fee deducted). /eligibility redirects.

update knowledge_base set
  answer = 'Start with the readiness check: a EUR 2.99 instant score, or a EUR 19 expert-reviewed report on your admission, finances and visa risk. When you are ready, our full application service handles shortlisting, documents, applications and your visa, and the EUR 19 is deducted from its fee.',
  page_link = '/readiness-check'
where question = 'How do I apply through Kuro?';

update knowledge_base set
  question = 'Is there still a USD 29 eligibility check?',
  answer = 'No. It has been replaced by the readiness check: a EUR 2.99 instant score, or a EUR 19 report reviewed by an expert, with a visa risk rating, a financial check and 3 destination comparisons.',
  page_link = '/readiness-check'
where question = 'What is the eligibility check?';

update knowledge_base set page_link = '/readiness-check' where page_link = '/eligibility';

update blog_posts set
  content = replace(content, '<a href="/eligibility">eligibility check</a>', '<a href="/readiness-check">readiness check</a>'),
  updated_at = now()
where content like '%href="/eligibility"%';
